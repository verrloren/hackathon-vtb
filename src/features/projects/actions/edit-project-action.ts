'use server';

import { getToken } from "@/features/auth";
import { projectsApi } from "@/features/projects";


 export const editProjectAction = async (id: string, name: string) => {
	const { token } = await getToken();
		try {
			const { success, response } = await projectsApi.updateProject({ id, name }, token);
			return {success, response }
		} catch (error) {
			console.error(error)
		}
 }
