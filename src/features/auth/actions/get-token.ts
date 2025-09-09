'use server';

import { cookies } from "next/headers";
import { fetchWithAuth } from "@/features/auth";

interface TokenResponse {
  token?: string;
}

export const getToken = async (): Promise<TokenResponse> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { 
      token
    };
  }
  
  return { 
    token 
  };
};


export const getValidatedToken = async () => {
	try {
		const response = await fetchWithAuth(`${process.env.BACKEND_API_URL}/api/users`, { method: "GET" });

		if (!response.success) {
			throw new Error('No access token');
		};

	} catch (error) {
		console.error(error);
	}
}