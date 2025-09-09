import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project } from "@/shared";

interface ProjectsStoreState {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  updateProjectName: (id: string, newName: string) => void;
  clearSelectedProject: (project: Project | null) => void;

  isComboboxOpen: boolean;
  setIsComboboxOpen: (isOpen: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isDeleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
}

export const useProjectsStore = create<ProjectsStoreState>()(
  persist(
    (set) => ({
      selectedProject: null,
      setSelectedProject: (project) => set({ selectedProject: project }),
      updateProjectName: (id, newName) =>
        set((state) => {
          if (state.selectedProject?.id === id) {
            return {
              selectedProject: {
                ...state.selectedProject,
                name: newName,
              },
            };
          }
          return state;
        }),
      clearSelectedProject: (nextProject) =>
        set(() => ({
          selectedProject: nextProject || null,
          isDeleteDialogOpen: false, // Close dialog when clearing
        })),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      isComboboxOpen: false,
      setIsComboboxOpen: (isOpen) => set({ isComboboxOpen: isOpen }),

      isDeleteDialogOpen: false,
      setDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
    }),
    {
      name: "project-storage",
    }
  )
);
