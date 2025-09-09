'use client';

import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { logout } from "@/features/auth";


export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      queryClient.clear();
      const result = await logout();
      if (result.success) {
        queryClient.removeQueries({ queryKey: ['projects'] });
        router.push('/auth/login');
        router.refresh();
      } else {
        toast.error(result.response);
      }
    } catch (error) {
      toast.error('Logout failed: ' + error);
    }
  };

  return { handleLogout };
};