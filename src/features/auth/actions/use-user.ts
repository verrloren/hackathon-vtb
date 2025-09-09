import { useQuery } from "@tanstack/react-query";
import { authApi, useUserId } from "@/features/auth";

export function useUser() {
	const userId = useUserId();
	return useQuery({
		...authApi.getUserById(userId!),
		enabled: Boolean(userId),
	})
}
