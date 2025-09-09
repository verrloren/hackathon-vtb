'use server';

import { getToken } from "@/features/auth";
import { projectsApi } from "@/features/projects";

 
export const deleteProjectAction = async (id: string) => {
const { token } = await getToken();
	try {
		const { success, response } = await projectsApi.deleteProject({ id }, token);
		return {success, response }
	} catch (error) {
		console.error(error)
	}
}