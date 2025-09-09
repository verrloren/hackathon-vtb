"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { ClientLoader, container } from "@/shared";
import { projectsApi } from "@/features/projects";
import { Project, Table } from "@/shared";
import { ProjectCard } from "./project-card";




export function ProjectsList() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: [projectsApi.baseKey],
    queryFn: projectsApi.getProjectsClient,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    select: (data) => {
      // Sort by busy projects first, then by updated_at desc
      return [...data].sort((a, b) => {
        const aStatus = getProjectStatus(a);
        const bStatus = getProjectStatus(b);

        const aBusy = aStatus === "pending" || aStatus === "processing";
        const bBusy = bStatus === "pending" || bStatus === "processing";

        if (aBusy !== bBusy) return aBusy ? -1 : 1;

        const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;

        return bTime - aTime;
      });
    },
  });

  // Helper to derive project status from its tables
  function getProjectStatus(project: Project): Table["status"] | "completed" | "pending" | "processing" | "error" {
    const statuses = project.tables?.map((t) => t.status) || [];
    if (statuses.includes("error")) return "error";
    if (statuses.includes("pending")) return "pending";
    if (statuses.includes("processing")) return "processing";
    // If all tables completed or no tables
    return "completed";
  }

  if (isLoading) return (
		<div className="w-full h-full flex justify-center items-center">
			<ClientLoader />
		</div>
	)

  // Prepare busy row and others using table statuses
  const enriched = projects.map((p) => ({
    project: p,
    status: getProjectStatus(p),
  }));
  const busy = enriched.filter(({ status }) => status === "pending" || status === "processing");
  const others = enriched.filter(({ status }) => !(status === "pending" || status === "processing"));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full min-h-screen space-y-4"
    >
      {busy.length > 0 && (
        <div className="grid grid-flow-col auto-cols-fr gap-4 md:gap-6">
          {busy.map(({ project, status }) => (
            <ProjectCard key={project.id} project={project} status={status} />
          ))}
        </div>
      )}

      <div className="grid gap-x-4 md:gap-x-6 md:gap-y-6 gap-y-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 ">
        {others.map(({ project, status }) => (
          <ProjectCard key={project.id} project={project} status={status} />
        ))}
      </div>

    </motion.div>
  );
}
