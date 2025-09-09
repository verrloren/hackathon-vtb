'use server';

import * as z from "zod";
import { RegisterSchema } from "@/shared";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
	const validatedFields = RegisterSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid fields" };
	}

	const { email, password, name: username } = validatedFields.data;

	try {
		const result = await fetch(`${process.env.BACKEND_API_URL}/api/users`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				"X-API-KEY": process.env.BACKEND_API_KEY as string,
			},
			body: JSON.stringify({ username, email, password })
		})

		const { success, response } = await result.json();
		return { success, response };

	} catch (error) {
		console.error(error);
		return { error: "Failed to create user" }
	}
}