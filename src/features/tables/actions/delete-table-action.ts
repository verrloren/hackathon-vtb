'use server';

import { tablesApi } from "@/entities/table/api/api";
import { getToken } from "@/features/auth";

export const deleteTableAction = async (id: string) => {
  const { token } = await getToken();
  try {
    const { success, response } = await tablesApi.deleteTable({ id }, token);
    return { success, response };
  } catch (error) {
    console.error(error);
    return { success: false, response: 'Failed to delete table' };
  }
};

