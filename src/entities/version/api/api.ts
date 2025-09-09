import { jsonApiInstance, UUID, ResponseDto } from "@/shared";
import type { FormattedSql } from "@/shared/model/types";



export type VersionStatus = 'pending' | 'processing' | 'success' | 'error';

// Minimal shape per current app usage: backend returns an array
// (optionally filtered or a single item when `id` is provided)
export interface VersionStatusResponse<T = unknown> {
  response: T[];
}

// Create payload/response according to backend docs
export interface CreateVersionRequest {
  commit_hash: string; // NAME
  query: {
    query_text: { sql: FormattedSql };
    status: string; // typically 'new'
  };
  table_id: UUID;
}

export interface CreateVersionResponse {
  success: boolean;
  response: {
    id: UUID;
    query_id: UUID;
  };
}

export interface UpdateVersionRequest {
  id: UUID;
  commit_hash?: string;
  pr_number?: number;
}

// no params for DELETE; body contains { id }


export const versionsApi = {
  baseKey: "versions",
  baseUrl: "/api/versions",

  getVersions: async (
    token: string | undefined,
    params?: { id?: UUID; table_id?: UUID }
  ) => {
    const qs = new URLSearchParams();
    if (params?.id) qs.set("id", params.id);
    if (params?.table_id) qs.set("table_id", params.table_id);
    const url = qs.toString() ? `/api/versions?${qs.toString()}` : "/api/versions";

    const response = await jsonApiInstance<VersionStatusResponse>(url, {
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

  createVersion: async (
    data: CreateVersionRequest,
    token: string | undefined
  ) => {
    return jsonApiInstance<CreateVersionResponse>(`/api/versions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
      },
      json: data,
    });
  },

  updateVersion: (
    data: UpdateVersionRequest,
    token: string | undefined
  ) => {
    const { id, ...payload } = data as UpdateVersionRequest & Record<string, unknown>;
    return jsonApiInstance<{ success: boolean; response: string }>(`/api/versions?id=${id}`,
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

  deleteVersion: (
    id: UUID,
    token: string | undefined
  ) => {
    return jsonApiInstance<ResponseDto>(`/api/versions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
      },
      json: { id },
    });
		
  },



	
	checkVersionStatus: async (versionId: UUID, token: string | undefined): Promise<VersionStatusResponse> => {
    return jsonApiInstance(`/api/versions?id=${versionId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY as string,
			},
			json: null
		});
  }
};
