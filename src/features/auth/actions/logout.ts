'use server';

import { cookies } from "next/headers";

import { ResponseDto } from "@/shared";


export const logout = async (): Promise<ResponseDto> => {
	try {
		const cookieStore = await cookies();
		cookieStore.delete('access_token');
		return { success: true, response: "Logged out successfully" };
	} catch (error) {
		console.error(error);
		return { success: false, response: "Error occurred" };
	}
}