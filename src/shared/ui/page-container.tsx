"use client";

import { ReactNode } from "react";
import { cn } from "@/shared";

interface PageContainerProps {
	children: ReactNode;
  className?: string | undefined;
}

const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div className={cn("relative w-full min-h-screen", className)}>
      {children}
    </div>
  );
}

export { PageContainer }