"use server";

import * as z from "zod";
import { LoginSchema } from "@/shared";
import { setSession } from "@/features/auth";


export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validatedFields.data;

  try {
    const result = await fetch(`${process.env.BACKEND_API_URL}/api/auth/login`, {
      method: "POST",
			credentials: "include",
      headers: {
        "Content-Type": "application/json",
				"X-API-KEY": process.env.BACKEND_API_KEY as string,
				'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const { success, response: token } = await result.json();

		if (success && token) {
			await setSession(token);
			return { success: true };
	} else {
			return { success: false };
	}

  } catch (error) {
    console.error(error);
    return { success: false, response: "Error occurred", cookies: [] };
  }
};
