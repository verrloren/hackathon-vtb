import { jsonApiInstance, ResponseDto } from "@/shared";
import { ProjectsResponse } from "@/features/projects";
import { Project } from "@/shared";



export type ProjectStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface ProjectStatusResponse {
  status: ProjectStatus;
}


export const projectsApi = {
  baseKey: "projects",
  baseUrl: "/api/projects",

  getProjects: async (token: string | undefined) => {
    const response = await jsonApiInstance<ProjectsResponse>("/api/projects", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
      },
      json: null,
    });
		console.log('response', response)
    if (!response) {
      return [];
    }
    return response.response;
  },

  // Client-safe fetcher via Next.js proxy route
  getProjectsClient: async () => {
    const res = await fetch("/api/app/projects", {
      method: "GET",
      // ensure we don't cache and always ask the server
      cache: "no-store",
    });
    if (!res.ok) return [] as Project[];
    const data = (await res.json()) as Project[];
    return data ?? ([] as Project[]);
  },

  createProject: async (
    data: {
      connection_string: string;
      name: string;
      table_name: string;
      table_schema: string; // will be hardcoded as ""
      user_id?: string;
    },
    token: string | undefined
  ) => {
    return jsonApiInstance<ResponseDto>(`/api/projects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
      },
      json: data,
    });
  },

  updateProject: (
    data: Partial<Project> & { id: string; name: string },
    token: string | undefined
  ) => {
    const { id, ...payload } = data as { id: string } & Record<string, unknown>;
    return jsonApiInstance<ResponseDto>(`/api/projects?id=${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-KEY": process.env.BACKEND_API_KEY as string,
        },
        json: payload,
      }
    );
  },

  deleteProject: (
    data: Partial<Project> & { id: string },
    token: string | undefined
  ) => {
    return jsonApiInstance<ResponseDto>(`/api/projects`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
      },
      json: data,
    });
		
  },



	
	checkProjectStatus: async (projectId: string, token: string | undefined): Promise<ProjectStatusResponse> => {
    return jsonApiInstance(`/api/projects?id=${projectId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
			},
			json: null
		});
  }
};
