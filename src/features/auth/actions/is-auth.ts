import { getToken } from "@/features/auth";


export const isAuth = async () => {
	try {
		const { token } = await getToken();

		if (!token) {
			return { success: false, response: "No access token" };
		}

		const result = await fetch(`${process.env.BACKEND_API_URL}/api/users`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-API-KEY": process.env.BACKEND_API_KEY as string,
				"Authorization": `Bearer ${token}`
			},
		})

		const { success, response } = await result.json();

		if (!success || !response) {
			return { success: false, response: "Unauthorized" };
		}

		return { success: true, response: "Authorized" };

	} catch (error) {
		console.error(error);
    return { success: false, response: "Error occurred" };
	}
}