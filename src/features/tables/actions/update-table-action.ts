'use server';

import { tablesApi } from "@/entities/table/api/api";
import { getToken } from "@/features/auth";

export const updateTableAction = async (id: string, name: string) => {
  const { token } = await getToken();
  try {
    const { success, response } = await tablesApi.updateTable({ id, name }, token);
    return { success, response };
  } catch (error) {
    console.error(error);
    return { success: false, response: 'Failed to update table' };
  }
};

