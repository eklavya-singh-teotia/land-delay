"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { createNewProject } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ShapBarChart } from "@/components/charts/ShapBarChart";
import { Upload, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export function NewProjectView() {
  const router = useRouter();

  const [projectType, setProjectType] = useState("road");
  const [spatialType, setSpatialType] = useState("linear");
  const [affectedFamilies, setAffectedFamilies] = useState<number>(100);

  const [rawInput, setRawInput] = useState("");
  const [parsedIds, setParsedIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<{
    project_id: string;
    parcels_created: number;
    missing_ids: string[];
    project_shap?: [string, number][];
  } | null>(null);

  const parseTextToIds = (text: string) => {
    const ids = Array.from(
      new Set(
        text
          .split(/[\s,\n;]+/)
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
    setParsedIds(ids);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawInput(val);
    parseTextToIds(val);
  };

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setRawInput(content);
      parseTextToIds(content);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".txt"] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedIds.length === 0) {
      setErrorMsg("Please upload a CSV or paste parcel IDs before creating.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await createNewProject({
        project_type: projectType,
        spatial_type: spatialType,
        affected_families: affectedFamilies,
        parcel_ids: parsedIds,
      });
      setAssessmentResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New Project Assessment"
        subtitle="Onboard a new land acquisition project, tag parcel IDs via CSV upload, and run predictive risk scoring & SHAP analysis"
      />

      <div className="space-y-6 max-w-4xl">
        {/* Form Card */}
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)] shadow-2xs space-y-6 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-1.5">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text-primary)] font-semibold"
                >
                  <option value="road">Road (RDH)</option>
                  <option value="rail">Rail (RLY)</option>
                  <option value="irrigation">Irrigation (IRR)</option>
                  <option value="dam">Dam (DAM)</option>
                  <option value="industrial">Industrial (IND)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-1.5">
                  Spatial Type
                </label>
                <select
                  value={spatialType}
                  onChange={(e) => setSpatialType(e.target.value)}
                  className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text-primary)] font-semibold"
                >
                  <option value="linear">Linear (Corridor)</option>
                  <option value="point">Point (Localized)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-1.5">
                  Affected Families (DPR)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={affectedFamilies}
                  onChange={(e) => setAffectedFamilies(Number(e.target.value))}
                  className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text-primary)] font-semibold"
                />
              </div>
            </div>

            {/* Parcel CSV Dropzone */}
            <div>
              <label className="block text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-1.5">
                Upload Parcel CSV or Drag & Drop File
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-[var(--navy)] bg-[var(--bg-surface-hover)]"
                    : "border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)]"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto text-[#4A90A4] mb-2" />
                <p className="text-xs font-semibold text-[var(--navy)]">
                  Drag and drop your parcel CSV file here, or click to browse
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Accepts .csv or .txt files containing parcel IDs</p>
              </div>
            </div>

            {/* Alternative Manual Text Area */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Or paste parcel IDs (comma or newline separated)
              </label>
              <textarea
                rows={4}
                value={rawInput}
                onChange={handleTextChange}
                placeholder="e.g. HP-KNG-0001-0123, HP-KNG-0001-0124, HP-KNG-0001-0125"
                className="w-full text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border)] rounded-md p-3 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
              />
            </div>

            {/* Parse Feedback Badge */}
            {parsedIds.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-surface-hover)] border border-[var(--border)] text-[var(--navy)] rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-profit)]" />
                <span>Successfully parsed {parsedIds.length} unique parcel IDs</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-[var(--color-loss)] rounded-lg text-xs font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || parsedIds.length === 0}
              className={`w-full py-3 rounded-lg text-xs font-bold text-white shadow-xs transition-all ${
                loading || parsedIds.length === 0
                  ? "bg-[var(--text-muted)] cursor-not-allowed opacity-60"
                  : "bg-[#1F4E79] hover:bg-[#1F4E79]/90 cursor-pointer"
              }`}
            >
              {loading ? "Creating & Scoring Project..." : "Create & Run Assessment"}
            </button>
          </form>
        </div>

        {/* Instant Assessment Results & SHAP Analysis */}
        {assessmentResult && (
          <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-emerald-500/30 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-profit)]" />
                <h3 className="text-sm font-bold text-[var(--navy)]">
                  Assessment Created: {assessmentResult.project_id}
                </h3>
              </div>
              <span className="text-xs font-bold text-[var(--color-profit)] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {assessmentResult.parcels_created} Parcels Scored
              </span>
            </div>

            {/* SHAP Analysis Chart */}
            {assessmentResult.project_shap && assessmentResult.project_shap.length > 0 && (
              <ShapBarChart
                factors={assessmentResult.project_shap}
                title="New Assessment Risk Drivers — SHAP Analysis"
              />
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => router.push(`/projects?id=${encodeURIComponent(assessmentResult.project_id)}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1F4E79] text-white text-xs font-bold rounded-lg hover:bg-[#1F4E79]/90 transition-colors shadow-xs cursor-pointer"
              >
                <span>View Full Project Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

