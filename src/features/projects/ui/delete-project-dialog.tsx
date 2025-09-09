"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@radix-ui/react-icons";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  Loader,
  Button,
} from "@/shared";
import {
  useProjectsStore,
  useDeleteProjectMutation,
} from "@/features/projects";
import styles from "@/features/projects/ui/project-card.module.css";

interface DeleteProjectDialogProps {
  projectId?: string;
  bg?: string;
  border?: string;
  text?: string;
  rounded?: string;
  wfull?: string;
  redirect?: boolean;
	glassy?: boolean;
}

export function DeleteProjectDialog({
  projectId,
  bg,
  border,
  text,
  rounded,
  wfull,
  redirect,
	glassy
}: DeleteProjectDialogProps) {
  const selectedProject = useProjectsStore((state) => state.selectedProject);
  const { deleteProject } = useDeleteProjectMutation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = useProjectsStore((state) => state.isDeleteDialogOpen);
  const setIsOpen = useProjectsStore((state) => state.setDeleteDialogOpen);

  const onDelete = async () => {
    if (!selectedProject) {
      toast.error("No project selected");
      return;
    }
    try {
      setIsLoading(true);
      setIsOpen(false);
      if (projectId) {
        await deleteProject(projectId);
        setIsOpen(false);
      } else {
        await deleteProject(selectedProject.id);
        if (redirect) {
          // Add small delay for better UX
          await new Promise((resolve) => setTimeout(resolve, 1000));
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete project");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
						className={`h-12 py-2 px-2  hover:border-white  shadow-none text-white transition-colors hover:text-white 
						${wfull === "wfull" ? "w-full" : "w-12"} 
						${border === "none" ? "border-none" : `border border-black/90 hover:border-white`}
						${glassy ? "hover:bg-transparent bg-transparent" : " bg-transparent hover:bg-white/5"} 
						${bg === "black" ? "bg-black/90 hover:bg-black/90" : "bg-transparent"} 
						${rounded === "full" ? `rounded-full  ${styles.glassRound} text-white` : "rounded-lg text-neutral-300 hover:text-white"} 
					`}
					//           className={`h-12 w-12 py-2 px-2 shadow-none flex items-center justify-center transition-colors text-neutral-200 bg-transparent text-sm ${styles.glassRound}
					// 	${wfull === "wfull" ? "w-full" : "w-12"}
					// 	${border === "none" ? "border-none" : "border border-black/90 hover:border-white"}
					// 	${bg === "black" ? "hover:bg-black/90 bg-black/80" : " bg-transparent hover:bg-white/5"} 
					// 	${glassy ? "hover:bg-transparent bg-transparent" : " bg-transparent hover:bg-white/5"} 
					// 	${rounded === "full" ? "rounded-full " : "rounded-lg"}
					// `}
          >
            <TrashIcon className="text-white peer-hover:text-white peer-hover:rotate-90" />
            <span className="text-base text-neutral-200 pl-1">{text ?? text}</span>
          </Button>
        </DialogTrigger>

        <DialogContent
          className="w-full py-8 bg-neutral-950 border-l-neutral-800 rounded-2xl
          flex flex-col justify-center overflow-hidden border-neutral-800
          px-8 gap-y-12"
        >
          <DialogHeader>
            <DialogTitle className="text-white text-5xl text-center">
              Are you sure?
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="text-neutral-600 font-poppins text-lg text-center">
            Deleting this project will permanently remove it from your account.
          </DialogDescription>

          <DialogFooter className="flex flex-row items-center gap-x-4">
            <DialogClose
              id="dialog-close-button"
              className="py-3 w-full text-xl bg-transparent border border-neutral-800 hover:text-neutral-500 text-neutral-600 font-poppins rounded-2xl z-40 hover:border-neutral-800 transition-colors hover:brightness-125"
              type="submit"
            >
              Cancel
            </DialogClose>
            <Button
              disabled={!selectedProject}
              className="py-6 w-full text-xl bg-red-600/75 text-white font-poppins rounded-2xl z-40 transition-colors hover:bg-red-600/90 hover:border-red-500"
              type="submit"
              onClick={onDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isLoading && <Loader loading={true} />}
    </>
  );
}
