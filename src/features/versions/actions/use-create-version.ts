"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects";
import { createVersionAction } from "@/features/versions/actions/create-version-action";
import { Project } from "@/shared";
import type { FormattedSql } from "@/shared/model/types";

type CreateVersionVars = {
  projectId: string;
  tableId: string;
  commit_hash: string;
  sql: FormattedSql;
};

export function useCreateVersionMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ tableId, commit_hash, sql }: CreateVersionVars) => {
      const payload = {
        commit_hash,
        table_id: tableId,
        query: {
          query_text: { sql },
          status: "new",
        },
      } as const;
      return await createVersionAction(payload);
    },
    onMutate: async ({ projectId, tableId, commit_hash, sql }) => {
      await queryClient.cancelQueries({ queryKey: [projectsApi.baseKey] });
      const previousProjects = queryClient.getQueryData<Project[]>([
        projectsApi.baseKey,
      ]);

      const now = new Date().toISOString();
      const tempVersionId = `temp-ver-${Date.now()}`;
      const tempQueryId = `temp-q-${Date.now()}`;

      if (previousProjects) {
        const updated = previousProjects.map((p) => {
          if (String(p.id) !== String(projectId)) return p;
          return {
            ...p,
            tables: (p.tables ?? []).map((t) => {
              if (String(t.id) !== String(tableId)) return t;

              const newVersion = {
                id: tempVersionId,
                commit_hash,
                pr_number: null,
                queries: [
                  {
                    id: tempQueryId,
                    query_text: { sql },
                    query_fingerprint: null,
                    status: "new",
                    reason: null,
                    explain_json: null,
                    suggested_query_text: [],
                    version_id: tempVersionId,
                    created_at: now,
                    updated_at: now,
                  },
                ],
                metrics: [],
                suggested_query_text: [],
                analysis_text: "",
                status: "pending",
                table_id: tableId,
                created_at: now,
                updated_at: now,
              };
              return { ...t, versions: [...(t.versions ?? []), newVersion] };
            }),
          } as Project;
        });
        queryClient.setQueryData([projectsApi.baseKey], updated);
      }
      return { previousProjects } as const;
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousProjects) {
        queryClient.setQueryData([projectsApi.baseKey], ctx.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [projectsApi.baseKey] });
    },
  });

  return {
    createVersion: (vars: CreateVersionVars) => mutation.mutateAsync(vars),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
