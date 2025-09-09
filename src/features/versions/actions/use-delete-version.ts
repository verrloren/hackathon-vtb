"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects";
import { deleteVersionAction } from "@/features/versions/actions/delete-version-action";
import type { Project, UUID } from "@/shared";

export function useDeleteVersionMutation(projectId: UUID, tableId: UUID) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (versionId: UUID) => deleteVersionAction(versionId),
    onMutate: async (versionId: UUID) => {
      await queryClient.cancelQueries({ queryKey: [projectsApi.baseKey] });
      const previousProjects = queryClient.getQueryData<Project[]>([projectsApi.baseKey]);

      if (previousProjects) {
        const updated = previousProjects.map((p) => {
          if (String(p.id) !== String(projectId)) return p;
          return {
            ...p,
            tables: (p.tables ?? []).map((t) =>
              String(t.id) === String(tableId)
                ? { ...t, versions: (t.versions ?? []).filter((v) => String(v.id) !== String(versionId)) }
                : t,
            ),
          } as Project;
        });
        queryClient.setQueryData([projectsApi.baseKey], updated);
      }

      return { previousProjects } as const;
    },
    onError: (_err, _versionId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData([projectsApi.baseKey], context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [projectsApi.baseKey] });
    },
  });

  return {
    deleteVersion: (versionId: UUID) => mutation.mutateAsync(versionId),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

