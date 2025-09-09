import { jsonApiInstance, ResponseDto, Table, UUID } from "@/shared";



export type TableStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface TableStatusResponse {
  response: Table[];
}


export const tablesApi = {
  baseKey: "tables",
  baseUrl: "/api/tables",

  getTables: async (token: string | undefined) => {
    const response = await jsonApiInstance<TableStatusResponse>("/api/tables", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
      },
      json: null,
    });
    if (!response) {
      return [];
    }
    return response.response;
  },

  createTable: async (
    data: CreateTableRequest,
    token: string | undefined
  ) => {
    return jsonApiInstance<CreateTableResponse>(`/api/tables`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
      },
      json: data,
    });
  },

  updateTable: (
    data: Partial<Table> & { id: string; name: string },
    token: string | undefined
  ) => {
    const { id, ...payload } = data as { id: string } & Record<string, unknown>;
    return jsonApiInstance<ResponseDto>(`/api/tables?id=${id}`,
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

  deleteTable: (
    data: Partial<Table> & { id: string },
    token: string | undefined
  ) => {
    return jsonApiInstance<ResponseDto>(`/api/tables`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
      },
      json: data,
    });
		
  },



	
	checkTableStatus: async (projectId: string, token: string | undefined): Promise<TableStatusResponse> => {
    return jsonApiInstance(`/api/tables?id=${projectId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
			},
			json: null
		});
  }
};

// Types aligned with backend docs for POST /api/tables
export interface CreateTableRequest {
  connection_string: string;
  name: string;
  project_id: UUID;
  schema: string; // e.g. "public"
}

export interface CreateTableResponse {
  success: boolean;
  response: {
    id: UUID;
  };
}
