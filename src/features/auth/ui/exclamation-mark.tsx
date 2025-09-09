'use client'

import { AiOutlineExclamation } from "react-icons/ai"


export function ExclamationMark() {
	return (
		<div className="w-4 h-4 flex justify-center items-center rounded-full bg-red-600">
			<AiOutlineExclamation size="14" className="text-neutral-50" />
		</div>
	)
}
