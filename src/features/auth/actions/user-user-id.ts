import { useAuthStore } from "@/features/auth";

export const useUserId = () => {
  return useAuthStore((state) => state.userId);
};