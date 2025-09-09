'use server';

import { getToken } from "@/features/auth";

export const getMD = async (projectId: string) => {
  const { token } = await getToken();

  if (!token) {
    throw new Error("No access token");
  }
	try {
  const result = await fetch(`${process.env.BACKEND_API_URL}/api/report`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': process.env.BACKEND_API_KEY as string,
      'id': `${projectId}`,
    },
  });

	return await result.json();
} catch (error) {
	console.error(error)
}
	
};
