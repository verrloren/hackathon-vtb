'use server';

import { versionsApi } from "@/entities/version/api";
import type { CreateVersionRequest } from "@/entities/version/api";
import { getToken } from "@/features/auth";


export const createVersionAction = async (data: CreateVersionRequest) => {
const { token } = await getToken();
	try {
		const { success, response } = await versionsApi.createVersion(data, token);
		return { success, response };
	} catch (error) {
		console.error(error)
	}
}
