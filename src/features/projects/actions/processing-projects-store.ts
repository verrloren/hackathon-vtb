import { create } from 'zustand';

interface ProcessingProjectsState {
  processingProjects: string[];
  addProcessingProject: (projectId: string) => void;
  removeProcessingProject: (projectId: string) => void;
}

export const useProcessingProjectsStore = create<ProcessingProjectsState>((set) => ({
  processingProjects: [],
  addProcessingProject: (projectId) =>
    set((state) => ({
      processingProjects: [...new Set([...state.processingProjects, projectId])]
    })),
  removeProcessingProject: (projectId) =>
    set((state) => ({
      processingProjects: state.processingProjects.filter(id => id !== projectId)
    }))
}));
