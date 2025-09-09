import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Project } from "@/shared";
import { useProjectsStore, deleteProjectAction, projectsApi } from "@/features/projects";


export const useDeleteProjectMutation = () => {

	const queryClient = useQueryClient();
	const clearSelectedProject = useProjectsStore(state => state.clearSelectedProject);

	const deleteProjectMutation = useMutation({
		mutationFn: (id: string) => deleteProjectAction(id),
		onMutate: async projectId => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: [projectsApi.baseKey],
			});
			 // Snapshot the previous value
			const previousProjects = queryClient.getQueryData<Project[]>([projectsApi.baseKey]);
			// Optimistically update to the new value
			if(previousProjects){
				queryClient.setQueryData<Project[]>([projectsApi.baseKey], 
					old => old ? old.filter(project => project.id !== projectId) : []
				)
				clearSelectedProject(previousProjects[0]);
				toast.success("Project deleted successfully");
			}

			return { previousProjects, projectId };
		},
    onError: (error, projectId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          [projectsApi.baseKey],
          context.previousProjects
        );
      }
    },

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: [projectsApi.baseKey] })
		}
	});

	const deleteProject = async (id: string) => {
		const result = await deleteProjectMutation.mutateAsync(id);
		if (!result?.success) {
      throw new Error(result?.response || 'Failed to delete project');
    }
    return result;
	};

	return { deleteProject, error: deleteProjectMutation.error };
}
