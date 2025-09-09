'use client'

import { motion } from 'framer-motion';

import { EditProjectSheet, DeleteProjectDialog } from "@/features/projects";


export function ActionButtons({ redirect, rounded, bg }: { redirect?: boolean, rounded?: string, bg?: string }) {


	return (

		<motion.div 
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6, delay : 0.15, ease: "easeInOut" }}
			className="flex flex-row items-center gap-x-2"
		>
			

			{/* EDIT */}
			<EditProjectSheet glassy={true} bg={bg} rounded={rounded} />

			{/* DELETE */}
			<DeleteProjectDialog glassy={true} bg={bg} rounded={rounded} redirect={redirect} />

			{/* SETTINGS */}
			{/* <SheetComponent  /> */}
		</motion.div>

	)
}