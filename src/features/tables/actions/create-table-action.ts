'use server';

import { tablesApi, type CreateTableRequest } from "@/entities/table/api/api";
import { getToken } from "@/features/auth";

export const createTableAction = async (data: CreateTableRequest) => {
  const { token } = await getToken();
  try {
    const { success, response } = await tablesApi.createTable(data, token);
    return { success, response };
  } catch (error) {
    console.error(error);
    return { success: false, response: 'Failed to create table' };
  }
};

