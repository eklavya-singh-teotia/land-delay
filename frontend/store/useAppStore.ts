import { create } from "zustand";

export type Role = "Admin" | "Officer" | "Viewer";
export type Theme = "light" | "dark";

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  role: Role;
  setRole: (role: Role) => void;
  selectedProject: string | null;
  setSelectedProject: (id: string | null) => void;
  selectedParcel: string | null;
  setSelectedParcel: (id: string | null) => void;
}

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
};

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  setTheme: (theme: Theme) => {
    applyThemeToDOM(theme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bhoomi_theme", theme);
      } catch (e) {}
    }
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === "light" ? "dark" : "light";
      applyThemeToDOM(nextTheme);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("bhoomi_theme", nextTheme);
        } catch (e) {}
      }
      return { theme: nextTheme };
    });
  },
  role: "Admin",
  setRole: (role) => set({ role }),
  selectedProject: null,
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  selectedParcel: null,
  setSelectedParcel: (selectedParcel) => set({ selectedParcel }),
}));

