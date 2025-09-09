'use server';

import { getToken } from "@/features/auth";


 export const sendProjectFiles = async (formData: FormData) => {

	const { token } = await getToken();

	if (!token) {
		return { success: false, response: "No access token" };
	}

	if (!formData) {
		return { success: false, response: "Invalid Files" };
	}
		try {
			console.log('fetch started:', formData);
			const response = await fetch(`${process.env.BACKEND_API_URL}/api/upload/files`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'X-API-KEY': process.env.BACKEND_API_KEY as string
				},
				body: formData,
			});

			const responseJSON = await response.json();
			

			if (!responseJSON.success) {
				return { success: false, response: `HTTP error! status: ${response.status}` };
		}


			return responseJSON;
		} catch (error) {
			if (error instanceof Error) {
				return { success: false, response: error.message };
			} else {
				return { success: false, response: "An unknown error occurred" };
			}
		}
 }
