'use client'

import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
	className?: string;
}

export function Container({ children, className }: ContainerProps) {
	return (	
		<div className={`mx-4 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20 2xl:mx-24 relative ${className}`}>
			{children}
		</div>
	)
}
