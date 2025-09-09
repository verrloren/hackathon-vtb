'use server';

import { versionsApi } from "@/entities/version/api";
import { getToken } from "@/features/auth";
import type { UUID } from "@/shared";

export const deleteVersionAction = async (id: UUID) => {
  const { token } = await getToken();
  try {
    const { success, response } = await versionsApi.deleteVersion(id, token);
    return { success, response };
  } catch (error) {
    console.error(error);
    return { success: false, response: 'Failed to delete version' };
  }
};

