import { UseQueryOptions } from "@tanstack/react-query";

import { UserDto } from "@/entities";
import { jsonApiInstance } from "@/shared";



export const authApi = {
  baseKey: "users",
  getUserById: (id: string): UseQueryOptions<UserDto> => {
    return {
      queryKey: [authApi.baseKey, "byId", id],
      queryFn: (meta) =>
        jsonApiInstance<UserDto>(`/users/${id}`, {
          signal: meta.signal,
          json: null,
        }),
    };
  },
  loginUser: ({ login, password }: { login: string; password: string }) =>
    jsonApiInstance<UserDto[]>(`/users?login=${login}&password=${password}`, {
      json: null,
    }).then((r) => r[0] as UserDto | undefined),
};
