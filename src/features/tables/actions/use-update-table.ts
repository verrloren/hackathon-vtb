"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects";
import { updateTableAction } from "@/features/tables/actions/update-table-action";
import { Project } from "@/shared";

type Vars = { projectId: string; tableId: string; name: string };

export function useUpdateTableMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ tableId, name }: Vars) => updateTableAction(tableId, name),
    onMutate: async ({ projectId, tableId, name }: Vars) => {
      await queryClient.cancelQueries({ queryKey: [projectsApi.baseKey] });
      const previousProjects = queryClient.getQueryData<Project[]>([projectsApi.baseKey]);

      if (previousProjects) {
        const updated = previousProjects.map((p) => {
          if (p.id !== projectId) return p;
          const tables = (p.tables ?? []).map((t) => (t.id === tableId ? { ...t, name } : t));
          return { ...p, tables };
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
    updateTable: (vars: Vars) => mutation.mutateAsync(vars),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

