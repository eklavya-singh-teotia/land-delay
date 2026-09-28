"use client";

import { useEffect } from "react";
import { useAppStore, Theme } from "@/store/useAppStore";

export function ThemeSync() {
  const setTheme = useAppStore((state) => state.setTheme);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("bhoomi_theme") as Theme | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }
    } catch (e) {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [setTheme]);

  return null;
}
