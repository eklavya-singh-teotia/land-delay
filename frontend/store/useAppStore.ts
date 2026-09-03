import { create } from "zustand";

export type Role = "Admin" | "Officer" | "Viewer";

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  selectedProject: string | null;
  setSelectedProject: (id: string | null) => void;
  selectedParcel: string | null;
  setSelectedParcel: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: "Admin",
  setRole: (role) => set({ role }),
  selectedProject: null,
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  selectedParcel: null,
  setSelectedParcel: (selectedParcel) => set({ selectedParcel }),
}));
