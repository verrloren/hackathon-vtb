"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects";
import { updateVersionAction } from "@/features/versions/actions/update-version-action";
import type { Project, UUID } from "@/shared";

type Vars = {
  projectId: UUID;
  tableId: UUID;
  versionId: UUID;
  commit_hash?: string;
  pr_number?: number | null;
};

export function useUpdateVersionMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ versionId, commit_hash, pr_number }: Vars) =>
      updateVersionAction({ id: versionId, commit_hash, pr_number: pr_number ?? undefined }),
    onMutate: async ({ projectId, tableId, versionId, commit_hash, pr_number }: Vars) => {
      await queryClient.cancelQueries({ queryKey: [projectsApi.baseKey] });
      const previousProjects = queryClient.getQueryData<Project[]>([projectsApi.baseKey]);

      if (previousProjects) {
        const updated = previousProjects.map((p) => {
          if (String(p.id) !== String(projectId)) return p;
          return {
            ...p,
            tables: (p.tables ?? []).map((t) => {
              if (String(t.id) !== String(tableId)) return t;
              return {
                ...t,
                versions: (t.versions ?? []).map((v) =>
                  String(v.id) === String(versionId)
                    ? {
                        ...v,
                        commit_hash: commit_hash ?? v.commit_hash,
                        pr_number: pr_number ?? v.pr_number ?? null,
                        updated_at: new Date().toISOString(),
                      }
                    : v,
                ),
              };
            }),
          } as Project;
        });
        queryClient.setQueryData([projectsApi.baseKey], updated);
      }

      return { previousProjects } as const;
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData([projectsApi.baseKey], context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [projectsApi.baseKey] });
    },
  });

  return {
    updateVersion: (vars: Vars) => mutation.mutateAsync(vars),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

