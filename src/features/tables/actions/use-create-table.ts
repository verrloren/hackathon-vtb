"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects";
import { type CreateTableRequest } from "@/entities/table/api/api";
import { createTableAction } from "@/features/tables/actions/create-table-action";
import { Project, Table } from "@/shared";

type CreateVars = {
  projectId: string;
  name: string;
  connection_string: string;
  schema?: string;
};

export function useCreateTableMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ projectId, name, connection_string, schema }: CreateVars) => {
      const payload: CreateTableRequest = {
        connection_string,
        name,
        project_id: projectId,
        schema: schema ?? "",
      };
      const res = await createTableAction(payload);
      return res;
    },
    onMutate: async ({ projectId, name, connection_string }) => {
      await queryClient.cancelQueries({ queryKey: [projectsApi.baseKey] });
      const previousProjects = queryClient.getQueryData<Project[]>([projectsApi.baseKey]);

      if (previousProjects) {
        const tempId = `temp-${Date.now()}`;
        const updated = previousProjects.map((p) => {
          if (p.id !== projectId) return p;
          const newTable: Table = {
            id: tempId,
            name,
            schema: "",
            connection_string,
            default_limits: "",
            status: "pending",
            versions: [],
            project_id: projectId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return { ...p, tables: [...(p.tables ?? []), newTable] } as Project;
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
    createTable: (vars: CreateVars) => mutation.mutateAsync(vars),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

