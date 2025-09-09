'use client';

import { useQuery } from '@tanstack/react-query';

import { projectsApi, useProcessingProjectsStore } from "@/features/projects";

export const useProjectStatus =  (projectId: string) => {
	const token = typeof document !== 'undefined' ? document.cookie : '';
  const removeProcessingProject = useProcessingProjectsStore(state => state.removeProcessingProject);

  return useQuery({
    queryKey: ['project-status', projectId],
    queryFn: () => projectsApi.checkProjectStatus(projectId, token),
    // enabled: !!projectId,
    enabled: false,
    refetchInterval: 500000, // Poll every 5 seconds 00 remove
    refetchIntervalInBackground: true,
    retry: true,
    retryDelay: 5000,
    staleTime: 0,
    select: (data) => {
      if (data.status === 'completed' || data.status === 'error') {
        removeProcessingProject(projectId);
      }
      return data;
    }
  });
};
