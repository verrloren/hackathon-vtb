"use client";

import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon } from "@radix-ui/react-icons";

import {
	Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
	Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared";
import { Project } from "@/shared";
import { getProjectsAction, projectsApi, StatusIndicator, useProjectsStore } from "@/features/projects";

export function ProjectsCombobox() {
  const selectedProject = useProjectsStore((state) => state.selectedProject);
  const setSelectedProject = useProjectsStore((state) => state.setSelectedProject);
  const isComboboxOpen = useProjectsStore((state) => state.isComboboxOpen);
  const setIsComboboxOpen = useProjectsStore((state) => state.setIsComboboxOpen);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: [projectsApi.baseKey],
    queryFn: getProjectsAction,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const status = (() => {
    const statuses = selectedProject?.tables?.map((t) => t.status) || [];
    if (statuses.includes("error")) return "error" as const;
    if (statuses.includes("pending")) return "pending" as const;
    if (statuses.includes("processing")) return "processing" as const;
    return "completed" as const;
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1}}
      transition={{ duration: 0.6, delay: 0.13, ease: "easeInOut" }}
      className="flex justify-center items-center"
    >
      <StatusIndicator size="lg" status={status} />

      <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={isComboboxOpen}
            className="text-7xl 2xl:text-8xl font-poppins flex justify-center items-center border-none h-auto
						text-white gap-x-4 hover:bg-transparent hover:text-white focus:outline-none focus:border-none"
          >
            <span className="text-center -pt-4 relative -top-2">{selectedProject?.name || "Select Project"}</span>

            <motion.div
							className="w-full h-full flex items-center justify-center"
              animate={{ rotate: isComboboxOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown fontSize={24} width={24} height={24}  className="w-24 h-24 text-2xl font-semibold " />
            </motion.div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="mt-8 border-none rounded-2xl p-0 ">
          <Command className="bg-black border border-neutral-800  rounded-xl">
            <CommandInput
              className="text-white placeholder:text-neutral-400 font-poppins"
              placeholder="Search project..."
            />

            <CommandList>
              <CommandEmpty className="text-neutral-200 pl-4 py-2">
                No project found.
              </CommandEmpty>
              <CommandGroup>
                {projects.map((project) => (
                  <CommandItem
                    className="text-neutral-600  font-poppins flex items-center cursor-pointer 
										hover:text-white transition-colors"
                    key={project.id}
                    onSelect={() => {
                      setSelectedProject(project);
                      setIsComboboxOpen(false);
                    }}
                  >
                    {project.name}
                    {selectedProject?.id === project.id && (
                      <CheckIcon className="h-4 w-4 text-white ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}
