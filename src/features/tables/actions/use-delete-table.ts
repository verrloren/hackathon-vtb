"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects";
import { deleteTableAction } from "@/features/tables/actions/delete-table-action";
import { Project } from "@/shared";

export function useDeleteTableMutation(projectId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (tableId: string) => deleteTableAction(tableId),
    onMutate: async (tableId: string) => {
      await queryClient.cancelQueries({ queryKey: [projectsApi.baseKey] });
      const previousProjects = queryClient.getQueryData<Project[]>([projectsApi.baseKey]);

      if (previousProjects) {
        const updated = previousProjects.map((p) =>
          p.id === projectId
            ? { ...p, tables: (p.tables ?? []).filter((t) => t.id !== tableId) }
            : p
        );
        queryClient.setQueryData([projectsApi.baseKey], updated);
      }

      return { previousProjects } as const;
    },
    onError: (_err, _tableId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData([projectsApi.baseKey], context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [projectsApi.baseKey] });
    },
  });

  return {
    deleteTable: (tableId: string) => mutation.mutateAsync(tableId),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

