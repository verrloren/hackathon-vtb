'use server';

import { versionsApi } from "@/entities/version/api";
import type { UpdateVersionRequest } from "@/entities/version/api/api";
import { getToken } from "@/features/auth";

export const updateVersionAction = async (data: UpdateVersionRequest) => {
  const { token } = await getToken();
  try {
    const { success, response } = await versionsApi.updateVersion(data, token);
    return { success, response };
  } catch (error) {
    console.error(error);
    return { success: false, response: 'Failed to update version' };
  }
};

