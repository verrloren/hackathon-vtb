"use client";

import { useProjectsStore } from "@/features/projects";
import { motion } from "framer-motion";

export function ProjectName({ projectName }: { projectName: string }) {
  const currentProject = useProjectsStore((state) => state.selectedProject);
  return (
    <motion.h5
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: "easeInOut" }}
      className="text-white text-5xl md:text-7xl 2xl:text-8xl font-semibold"
    >
      {currentProject?.name ?? projectName}
    </motion.h5>
  );
}
