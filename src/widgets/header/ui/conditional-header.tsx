'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  const hideHeaderRoutes = ['/auth/login', '/auth/register'];

  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  return !shouldHideHeader ? <Header /> : null;
}