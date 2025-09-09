"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  Input,
  Label,
} from "@/shared";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth";
import { createProjectAction } from "@/features/projects";



type CreateProjectDialogProps = {
  trigger: React.ReactNode;
};

export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState("");
  const [connectionString, setConnectionString] = useState("");
  const [tableName, setTableName] = useState("");
  const userId = useAuthStore((state) => state.userId);

  const closeDialog = () => {
    const btn = document.getElementById("dialog-close-button");
    if (btn) (btn as HTMLButtonElement).click();
  };

  const handleCreateProject = async () => {
    if (!projectName || !connectionString || !tableName) {
      toast.error("Please fill required fields");
      return;
    }

    const isPg = /^postgresql:\/\//i.test(connectionString.trim());
    if (!isPg) {
      toast.error('Connection string must start with "postgresql://"');
      return;
    }

    const payload = {
      connection_string: connectionString.trim(),
      name: projectName,
      table_name: tableName,
      table_schema: "",
      userId,
    } as const;

    const result = await createProjectAction(payload);
    if (result?.success) {
      toast.success("Project created successfully");
      setProjectName("");
      setConnectionString("");
      setTableName("");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      closeDialog();
    } else {
      toast.error("Failed to create project");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="w-full py-8 bg-neutral-950 border-l-neutral-800 rounded-2xl flex flex-col justify-center overflow-hidden border-neutral-800 px-8 gap-y-12"
      >
        <DialogHeader>
          <DialogTitle className="text-white text-5xl text-center">
            New project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              className="bg-neutral-900 text-white border-neutral-800 font-poppins rounded-xl placeholder:text-neutral-600 focus:bg-neutral-900 focus:border-neutral-600"
              placeholder="My awesome project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection-string">Connection string</Label>
            <Input
              id="connection-string"
              className="bg-neutral-900 text-white border-neutral-800 font-poppins rounded-xl placeholder:text-neutral-600 focus:bg-neutral-900 focus:border-neutral-600"
              placeholder="postgresql://user:pass@host:5432/db"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-name">Table name</Label>
            <Input
              id="table-name"
              className="bg-neutral-900 text-white border-neutral-800 font-poppins rounded-xl placeholder:text-neutral-600 focus:bg-neutral-900 focus:border-neutral-600"
              placeholder="orders"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center gap-x-4">
          <DialogClose
            id="dialog-close-button"
            className="py-3 w-full text-xl bg-transparent border border-neutral-800 hover:text-neutral-500 text-neutral-600 font-poppins rounded-2xl z-40 hover:border-neutral-800 transition-colors hover:brightness-125"
            type="button"
          >
            Cancel
          </DialogClose>
          <Button
            className="py-6 w-full text-xl bg-white text-black font-poppins rounded-2xl z-40 transition-colors hover:bg-white/90 hover:border-white"
            type="button"
            onClick={handleCreateProject}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProjectDialog;
