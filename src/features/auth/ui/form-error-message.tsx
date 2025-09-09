'use client'

import { ExclamationMark } from "@/features/auth/ui/exclamation-mark";

interface FormErrorMessageProps {
	message?: string | undefined;
}

export function FormErrorMessage({ message }: FormErrorMessageProps) {
	return (
		<div className="flex flex-row justify-center gap-x-2">
			<ExclamationMark />
			<p className="text-red-500 text-sm">{message}</p>
		</div>
	)
}
