"""SIH26017 FastAPI endpoint.

Wraps src/predict.py and data generated files to expose RESTful APIs for the React/Next.js frontend.
Run:
  .venv/bin/uvicorn app.api:app --host 127.0.0.1 --port 8000
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import List, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

# allow `from predict import ...` (ml/src) and `from landing import ...` (backend/app)
_APP_DIR = Path(__file__).resolve().parent
ROOT = _APP_DIR.parent.parent
sys.path.insert(0, str(_APP_DIR))
sys.path.insert(0, str(ROOT / "ml" / "src"))

from landing import LANDING_HTML  # noqa: E402
import predict  # noqa: E402
import user_projects  # noqa: E402
from features import STAGES  # noqa: E402
from predict import load_artifacts, score_batch, score_parcel, risk_level, STATUTORY, DEFAULTS  # noqa: E402
PORTFOLIO_PATH = ROOT / "data" / "generated" / "portfolio_scores.parquet"
PROJECTS_PATH = ROOT / "data" / "generated" / "projects.parquet"
DISTRICTS_PATH = ROOT / "data" / "generated" / "districts.parquet"
VILLAGES_PATH = ROOT / "data" / "generated" / "villages.parquet"
LIVE_TIMELINE_PATH = ROOT / "data" / "generated" / "stage_timelines_live.parquet"
HIST_TIMELINE_PATH = ROOT / "data" / "generated" / "stage_timelines_historical.parquet"

app = FastAPI(title="BhoomiSetu — Land Acquisition Delay Predictor", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- #
# Helpers & Cache
# --------------------------------------------------------------------------- #

def get_portfolio_df() -> pd.DataFrame:
    if not PORTFOLIO_PATH.exists():
        predict.refresh_portfolio()
    main = pd.read_parquet(PORTFOLIO_PATH)
    main["is_user"] = 0
    user = user_projects.load_user_parcels()
    if len(user):
        user = user.copy()
        user["is_user"] = 1
        main = pd.concat([main, user], ignore_index=True)
    ovr = user_projects.load_overrides()
    if len(ovr):
        main = _apply_overrides(main, ovr)
    return main


def _apply_overrides(df: pd.DataFrame, ovr: pd.DataFrame) -> pd.DataFrame:
    artifacts = predict.load_artifacts()
    for _, o in ovr.iterrows():
        mask = df["project_id"] == o["project_id"]
        if not mask.any():
            continue
        df.loc[mask, "compensation_status"] = o["compensation_status"]
        df.loc[mask, "rehab_progress_pct"] = float(o["rehab_progress_pct"])
        scores = predict.score_batch(df[mask], artifacts, include_stages=True)
        cols = (["risk_score", "risk_level", "expected_overrun_days", "max_delay_prob"]
                + [f"{s}_prob" for s in STAGES] + [f"{s}_overrun" for s in STAGES])
        for col in cols:
            df.loc[mask, col] = scores[col].values
    return df


def load_live_timeline(parcel_id: str) -> dict:
    if not LIVE_TIMELINE_PATH.exists():
        return {}
    tl = pd.read_parquet(LIVE_TIMELINE_PATH)
    sub = tl[tl["parcel_id"] == parcel_id]
    out = {}
    for _, r in sub.iterrows():
        out[r["stage"]] = {
            "status": r["status"],
            "elapsed_days": None if pd.isna(r["elapsed_days"]) else int(r["elapsed_days"]),
            "actual_days": None if pd.isna(r["actual_days"]) else int(r["actual_days"]),
        }
    return out


def haversine(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dp, dl = np.radians(lat2 - lat1), np.radians(lon2 - lon1)
    a = np.sin(dp / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(a))


def df_to_json_records(df: pd.DataFrame) -> list[dict]:
    return json.loads(df.to_json(orient="records"))


# --------------------------------------------------------------------------- #
# Pydantic Schemas
# --------------------------------------------------------------------------- #

class ParcelFeatures(BaseModel):
    parcel_id: Optional[str] = None
    project_type: str = "road"
    compensation_status: str = "paid"
    land_class: str = "agri"
    affected_families: float = 0
    rehab_progress_pct: float = 100.0
    stakeholder_responsiveness: float = 1.0
    historical_performance_score: float = 1.0
    owner_count: float = 1
    area_sqm: float = 1000.0
    pending_mutations: float = 0
    court_stay: float = 0
    encumbrances: float = 0


class BatchRequest(BaseModel):
    parcels: List[ParcelFeatures]


class OverrideRequest(BaseModel):
    compensation_status: str
    rehab_progress_pct: float


class NewProjectRequest(BaseModel):
    project_type: str
    spatial_type: str
    affected_families: int
    parcel_ids: List[str]


# --------------------------------------------------------------------------- #
# Core / Legacy Routes
# --------------------------------------------------------------------------- #

@app.get("/", response_class=HTMLResponse)
def landing():
    return LANDING_HTML


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": load_artifacts() is not None}


@app.post("/predict")
def predict_endpoint(p: ParcelFeatures):
    features = p.model_dump()
    pid = features.pop("parcel_id", None)
    return score_parcel(features, parcel_id=pid)


@app.post("/predict/batch")
def predict_batch(req: BatchRequest):
    rows = []
    for p in req.parcels:
        d = p.model_dump()
        d.pop("parcel_id", None)
        rows.append({k: d.get(k, DEFAULTS[k]) for k in DEFAULTS})
    df = pd.DataFrame(rows)
    df["parcel_id"] = [p.parcel_id or f"REQ_{i}" for i, p in enumerate(req.parcels)]
    results = score_batch(df)
    return {"results": df_to_json_records(results)}


# --------------------------------------------------------------------------- #
# RESTful Data Routes for Frontend
# --------------------------------------------------------------------------- #

@app.get("/portfolio")
def get_portfolio(
    state: Optional[str] = None,
    district: Optional[str] = None,
    project_type: Optional[str] = None,
    risk_level: Optional[List[str]] = Query(None)
):
    df = get_portfolio_df()
    if state and state != "All":
        df = df[df["state"] == state]
    if district and district != "All":
        df = df[df["district"] == district]
    if project_type and project_type != "All":
        df = df[df["project_type"] == project_type]
    if risk_level:
        df = df[df["risk_level"].isin(risk_level)]
    return df_to_json_records(df)


@app.get("/portfolio/summary")
def get_portfolio_summary():
    df = get_portfolio_df()
    red = int((df["risk_level"] == "RED").sum())
    yel = int((df["risk_level"] == "YELLOW").sum())
    grn = int((df["risk_level"] == "GREEN").sum())
    return {
        "total_projects": int(df["project_id"].nunique()),
        "total_parcels": int(len(df)),
        "red_count": red,
        "yellow_count": yel,
        "green_count": grn,
        "avg_risk": round(float(df["risk_score"].mean()), 3) if len(df) else 0.0,
    }


@app.post("/portfolio/refresh")
def refresh_portfolio():
    predict.refresh_portfolio()
    return {"status": "refreshed"}


@app.get("/projects")
def get_projects():
    if not PROJECTS_PATH.exists():
        return []
    projects = pd.read_parquet(PROJECTS_PATH)
    return df_to_json_records(projects)


def compute_project_shap(sub_df: pd.DataFrame) -> list[list]:
    artifacts = predict.load_artifacts()
    feat_cols = artifacts["feature_columns"]
    rows = []
    for _, r in sub_df.iterrows():
        rows.append({c: r.get(c, DEFAULTS.get(c, 0.0)) for c in feat_cols})
    X_raw = pd.DataFrame(rows)
    X_encoded = predict._encode(X_raw, artifacts)

    contribs = {c: 0.0 for c in X_encoded.columns}
    import shap
    for stage in STAGES:
        if stage not in artifacts["explainers"]:
            artifacts["explainers"][stage] = shap.TreeExplainer(
                artifacts["models"][stage]["classifier"])
        sv = artifacts["explainers"][stage].shap_values(X_encoded)
        if isinstance(sv, list):
            sv = sv[1]
        vals = np.asarray(sv)
        if vals.ndim == 1:
            vals = np.expand_dims(vals, axis=0)
        mean_vals = np.mean(vals, axis=0)
        for i, c in enumerate(X_encoded.columns):
            contribs[c] += float(mean_vals[i])

    top = sorted(contribs.items(), key=lambda kv: -abs(kv[1]))[:8]
    return [[k, round(v, 4)] for k, v in top]


@app.get("/projects/{project_id}")
def get_project_detail(project_id: str):
    df = get_portfolio_df()
    sub = df[df["project_id"] == project_id]
    if sub.empty:
        raise HTTPException(status_code=404, detail="Project not found")

    p0 = sub.iloc[0]
    red = int((sub["risk_level"] == "RED").sum())
    yel = int((sub["risk_level"] == "YELLOW").sum())
    grn = len(sub) - red - yel

    # per-stage bottleneck
    stage_bottleneck = [
        {"stage": s, "avg_delay_prob": round(float(sub[f"{s}_prob"].mean()), 4)}
        for s in STAGES
    ]

    # segment profile by village
    seg = sub.groupby("village")["risk_score"].agg(["mean", "count"]).reset_index()
    segment_profile = [
        {"village": r["village"], "avg_risk": round(float(r["mean"]), 3), "count": int(r["count"])}
        for _, r in seg.iterrows()
    ]
    segment_profile.sort(key=lambda x: x["avg_risk"], reverse=True)

    # timeline analysis
    timeline = []
    for s in STAGES:
        stat = STATUTORY[s]
        exp_over = max(0.0, float(sub[f"{s}_overrun"].mean()))
        timeline.append({
            "stage": s,
            "statutory_days": stat,
            "expected_days": round(stat + exp_over, 1),
            "expected_overrun": round(exp_over, 1),
        })

    project_meta = {
        "project_id": project_id,
        "project_type": p0["project_type"],
        "spatial_type": p0["spatial_type"],
        "state": p0["state"],
        "district": p0["district"],
        "affected_families": int(p0["affected_families"]),
        "compensation_status": p0["compensation_status"],
        "rehab_progress_pct": float(p0["rehab_progress_pct"]),
        "stakeholder_responsiveness": float(p0["stakeholder_responsiveness"]),
    }

    kpis = {
        "n_parcels": len(sub),
        "avg_risk": round(float(sub["risk_score"].mean()), 3),
        "red": red,
        "yellow": yel,
        "green": grn,
        "avg_overrun": round(float(sub["expected_overrun_days"].mean()), 1),
    }

    project_shap = compute_project_shap(sub)

    return {
        "project_meta": project_meta,
        "kpis": kpis,
        "stage_bottleneck": stage_bottleneck,
        "segment_profile": segment_profile,
        "timeline": timeline,
        "project_shap": project_shap,
        "parcels": df_to_json_records(sub),
    }


@app.post("/projects/{project_id}/override")
def save_project_override(project_id: str, req: OverrideRequest):
    user_projects.save_override(project_id, req.compensation_status, req.rehab_progress_pct)
    return {"status": "success", "project_id": project_id}


@app.get("/parcels/{parcel_id}")
def get_parcel_detail(
    parcel_id: str,
    court_stay: Optional[int] = None,
    compensation_status: Optional[str] = None
):
    df = get_portfolio_df()
    sub = df[df["parcel_id"] == parcel_id]
    if sub.empty:
        raise HTTPException(status_code=404, detail="Parcel not found")

    row = sub.iloc[0]
    features = {c: row[c] for c in predict.DEFAULTS}

    if court_stay is not None:
        features["court_stay"] = float(court_stay)
    if compensation_status is not None:
        features["compensation_status"] = compensation_status

    artifacts = load_artifacts()
    timeline = load_live_timeline(parcel_id)
    contract = score_parcel(features, artifacts=artifacts, timeline=timeline, parcel_id=parcel_id)
    return contract


@app.get("/alerts")
def get_alerts():
    df = get_portfolio_df()
    alerts = []
    for _, r in df.iterrows():
        if r["overrun_while_ongoing_days"] and r["overrun_while_ongoing_days"] > 0:
            alerts.append({
                "parcel_id": r["parcel_id"],
                "alert_type": "overrun-while-ongoing",
                "detail": f"{r['overrun_while_ongoing_days']:.0f} days past legal limit"
            })
        if r["risk_level"] == "RED":
            alerts.append({
                "parcel_id": r["parcel_id"],
                "alert_type": "high-risk",
                "detail": f"risk {r['risk_score']:.2f}"
            })
        if int(r["court_stay"]) == 1:
            alerts.append({
                "parcel_id": r["parcel_id"],
                "alert_type": "court-stay",
                "detail": "active court stay"
            })
        if r["compensation_status"] != "paid":
            alerts.append({
                "parcel_id": r["parcel_id"],
                "alert_type": "compensation",
                "detail": f"compensation {r['compensation_status']}"
            })
        if r["expected_overrun_days"] > 365:
            alerts.append({
                "parcel_id": r["parcel_id"],
                "alert_type": "severe-overrun",
                "detail": f"{r['expected_overrun_days']:.0f} days expected overrun"
            })

    channels = ["SMS", "Email", "Push"]
    recipients = ["District Collector", "Project Manager", "Acquiring Officer", "Admin"]
    notifications = []
    for i, a in enumerate(alerts[:60]):
        notifications.append({
            "channel": channels[i % 3],
            "recipient": recipients[i % 4],
            "parcel_id": a["parcel_id"],
            "alert": a["alert_type"],
            "message": f"{a['parcel_id']} — {a['detail']}",
        })

    return {
        "total_alerts": len(alerts),
        "unique_parcels": len(set(a["parcel_id"] for a in alerts)),
        "alerts": alerts,
        "notifications": notifications,
    }


@app.get("/trends")
def get_trends():
    df = get_portfolio_df()

    # Risk by state
    s = df.groupby("state")["risk_score"].mean().sort_values(ascending=False)
    risk_by_state = [{"state": k, "avg_risk": round(float(v), 3)} for k, v in s.items()]

    # Delay prob per stage
    sp = {stg: round(float(df[f"{stg}_prob"].mean()), 4) for stg in STAGES}
    delay_prob_by_stage = [{"stage": k, "avg_prob": v} for k, v in sp.items()]

    # Risk by project type
    pt = df.groupby("project_type")["risk_score"].mean().sort_values(ascending=False)
    risk_by_project_type = [{"project_type": k, "avg_risk": round(float(v), 3)} for k, v in pt.items()]

    # Top districts by risk
    d = df.groupby("district")["risk_score"].mean().nlargest(12).sort_values(ascending=False)
    top_districts_by_risk = [{"district": k, "avg_risk": round(float(v), 3)} for k, v in d.items()]

    # Heatmap - district x stage
    heat_df = df.groupby("district")[[f"{stg}_prob" for stg in STAGES]].mean()
    heat_df["_m"] = heat_df.mean(axis=1)
    heat_df = heat_df.sort_values("_m", ascending=False).drop(columns="_m")
    heatmap = []
    for district, row in heat_df.iterrows():
        for stg in STAGES:
            heatmap.append({
                "district": district,
                "stage": stg,
                "avg_prob": round(float(row[f"{stg}_prob"]), 3)
            })

    # Historical overrun
    hist = pd.read_parquet(HIST_TIMELINE_PATH)
    hm = hist.groupby("stage")["delay_days"].mean().reindex(STAGES)
    historical_overrun = [{"stage": k, "mean_delay_days": round(float(v), 1)} for k, v in hm.items()]

    return {
        "risk_by_state": risk_by_state,
        "delay_prob_by_stage": delay_prob_by_stage,
        "risk_by_project_type": risk_by_project_type,
        "top_districts_by_risk": top_districts_by_risk,
        "heatmap": heatmap,
        "historical_overrun": historical_overrun,
    }


@app.get("/compare")
def get_compare(col: str = "district", a: str = "", b: str = ""):
    df = get_portfolio_df()
    if col not in ["district", "project_id"]:
        raise HTTPException(status_code=400, detail="col must be 'district' or 'project_id'")

    entities = sorted(df[col].unique())
    if not a:
        a = entities[0] if len(entities) > 0 else ""
    if not b:
        others = [e for e in entities if e != a]
        b = others[0] if len(others) > 0 else ""

    def summary(e):
        sub = df[df[col] == e]
        if sub.empty:
            return None
        return {
            "entity": e,
            "n": len(sub),
            "risk": round(float(sub["risk_score"].mean()), 3),
            "red": int((sub["risk_level"] == "RED").sum()),
            "yel": int((sub["risk_level"] == "YELLOW").sum()),
            "grn": int((sub["risk_level"] == "GREEN").sum()),
            "overrun": round(float(sub["expected_overrun_days"].mean()), 1),
            "maxprob": round(float(sub["max_delay_prob"].mean()), 4),
            "stages": [
                {"stage": s, "avg_prob": round(float(sub[f"{s}_prob"].mean()), 4)}
                for s in STAGES
            ],
        }

    return {
        "col": col,
        "entities": entities,
        "a": summary(a),
        "b": summary(b),
    }


@app.get("/area")
def get_area(state: str, district: str, village: str, radius_km: float = 15.0):
    df = get_portfolio_df()
    villages = pd.read_parquet(VILLAGES_PATH)

    vdd = villages[(villages["state"] == state) & (villages["district"] == district) & (villages["village"] == village)]
    if vdd.empty:
        raise HTTPException(status_code=404, detail="Center village not found")

    center = vdd.iloc[0]
    d = haversine(center["lat"], center["lon"], df["lat"], df["lon"])
    subset = df[d <= radius_km]

    kpis = {
        "parcels_in_area": len(subset),
        "red_count": int((subset["risk_level"] == "RED").sum()) if len(subset) else 0,
        "avg_risk": round(float(subset["risk_score"].mean()), 2) if len(subset) else 0.0,
        "avg_expected_overrun": round(float(subset["expected_overrun_days"].mean()), 0) if len(subset) else 0,
    }

    factors = []
    if len(subset):
        factors = [
            {"factor": "court stay", "count": int(subset["court_stay"].sum())},
            {"factor": "compensation pending", "count": int((subset["compensation_status"] != "paid").sum())},
            {"factor": "orchard land", "count": int((subset["land_class"] == "orchard").sum())},
            {"factor": "owners > 4", "count": int((subset["owner_count"] > 4).sum())},
            {"factor": "mutations >= 2", "count": int((subset["pending_mutations"] >= 2).sum())},
        ]

    parcels = df_to_json_records(subset.sort_values("risk_score", ascending=False).head(100)) if len(subset) else []

    return {
        "kpis": kpis,
        "factors": factors,
        "parcels": parcels,
    }


@app.get("/villages")
def get_villages():
    if not VILLAGES_PATH.exists():
        return []
    villages = pd.read_parquet(VILLAGES_PATH)
    return df_to_json_records(villages[["village", "district", "state", "lat", "lon"]].drop_duplicates())


@app.post("/projects/user")
def create_user_project(req: NewProjectRequest):
    found, missing = user_projects.pull_records(req.parcel_ids)
    if found.empty:
        raise HTTPException(status_code=400, detail="No valid parcels found for given IDs")

    home_state = found["state"].mode()[0]
    home_state_code = found["state_code"].mode()[0]
    home_district = found["district"].mode()[0]

    compensation = "pending"
    rehab = 0.0
    profile = user_projects.derive_institutional_profile(home_district)
    responsiveness = profile["stakeholder_responsiveness"]
    hist_perf = profile["historical_performance_score"]

    feat = found[["parcel_id", "owner_count", "land_class", "area_sqm",
                  "pending_mutations", "court_stay", "encumbrances"]].copy()
    feat["project_type"] = req.project_type
    feat["affected_families"] = req.affected_families
    feat["compensation_status"] = compensation
    feat["rehab_progress_pct"] = rehab
    feat["stakeholder_responsiveness"] = responsiveness
    feat["historical_performance_score"] = hist_perf

    artifacts = load_artifacts()
    scores = predict.score_batch(feat, artifacts, include_stages=True)
    geo = found[["parcel_id", "village", "village_code", "tehsil", "district",
                 "district_code", "state", "state_code"]]
    villages = pd.read_parquet(VILLAGES_PATH)[["village", "lat", "lon"]]
    rows = scores.merge(feat, on="parcel_id", how="left").merge(geo, on="parcel_id", how="left")
    rows = rows.merge(villages, on="village", how="left")

    pid = user_projects.generate_user_project_id(home_state_code, req.project_type)

    rows["spatial_type"] = req.spatial_type
    rows["project_id"] = pid
    rows["current_stage"] = None
    rows["overrun_while_ongoing_days"] = None

    if req.spatial_type == "linear":
        coords = [[float(v["lat"]), float(v["lon"])]
                  for _, v in rows[["village", "lat", "lon"]].drop_duplicates("village").iterrows()]
    else:
        coords = []

    project_row = {
        "project_id": pid, "project_type": req.project_type, "spatial_type": req.spatial_type,
        "coord_path": json.dumps(coords), "affected_families": req.affected_families,
        "compensation_status": compensation, "rehab_progress_pct": rehab,
        "stakeholder_responsiveness": responsiveness,
        "historical_performance_score": hist_perf, "state": home_state,
        "state_code": home_state_code, "district": home_district,
        "tehsil": found["tehsil"].mode()[0],
    }
    project_shap = compute_project_shap(rows)
    user_projects.persist_user(project_row, rows)
    return {"project_id": pid, "parcels_created": len(rows), "missing_ids": missing, "project_shap": project_shap}


@app.delete("/projects/user/reset")
def reset_user_projects():
    user_projects.reset_user_data()
    return {"status": "reset"}

