'use server';

import { getToken } from "@/features/auth";
import { projectsApi } from "@/features/projects";


export const createProjectAction = async (data: {
  connection_string: string;
  name: string;
  table_name: string;
  table_schema: string;
  user_id?: string;
}) => {
const { token } = await getToken();
	try {
		const { success, response } = await projectsApi.createProject(data, token);
		return { success, response };
	} catch (error) {
		console.error(error)
	}
}
