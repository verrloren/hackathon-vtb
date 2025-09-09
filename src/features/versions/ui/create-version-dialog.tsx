"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Button,
  Input,
  Label,
	buildSqlQuery,
} from "@/shared";
import dynamic from "next/dynamic";
import type { OnMount, BeforeMount } from "@monaco-editor/react";
import toast from "react-hot-toast";
import { useCreateVersionMutation } from "@/features/versions/actions/use-create-version";


type CreateVersionDialogProps = {
  trigger: React.ReactNode;
  tableId: string;
  projectId: string;
};





export function CreateVersionDialog({ trigger, tableId, projectId }: CreateVersionDialogProps) {
  const [versionName, setVersionName] = useState("");
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const { createVersion, isLoading } = useCreateVersionMutation();

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("transparent-vs-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        // Transparent backgrounds
        "editor.background": "#00000000",
        "editorGutter.background": "#00000000",
        "minimap.background": "#00000000",
        // Neutral-800 borders and focus outlines
        "focusBorder": "#262626",
        "editorGroup.border": "#262626",
        "editorWidget.border": "#262626",
        "panel.border": "#262626",
      },
    });
  };

  // Dynamically import Monaco editor on client only to avoid SSR/Turbopack issues
  const Editor = dynamic(async () => (await import("@monaco-editor/react")).default, {
    ssr: false,
    loading: () => <div className="h-32 w-full bg-black/30" />,
  });

  const closeDialog = () => {
    const btn = document.getElementById("dialog-close-button");
    if (btn) (btn as HTMLButtonElement).click();
  };

  const handleCreateVersion = async () => {
    if (!versionName) {
      toast.error("Please fill required fields");
      return;
    }

    const sqlValue = editorRef.current?.getValue?.() ?? "";
    if (!sqlValue) {
      toast.error("SQL editor is empty");
      return;
    }

		const buildedSqlQuery = buildSqlQuery(sqlValue)

    const result = await createVersion({
      projectId,
      tableId,
      commit_hash: versionName,
      sql: buildedSqlQuery,
    });
    if (result?.success) {
      toast.success("Version created successfully");
      setVersionName("");
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
            New version
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="version-name">Version name</Label>
            <Input
              id="version-name"
              className="bg-neutral-900 text-white border-neutral-800 font-poppins rounded-xl placeholder:text-neutral-600 focus:bg-neutral-900 focus:border-neutral-600"
              placeholder="My awesome version"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-sql">SQL query</Label>
            <div className="rounded-xl overflow-hidden border border-neutral-800">
              <Editor
                theme="transparent-vs-dark"
                height="25vh"
                defaultLanguage="sql"
                defaultValue=""
                onMount={handleEditorDidMount}
                beforeMount={handleBeforeMount}
                options={{
                  minimap: { enabled: false },
                }}
              />
            </div>
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
            disabled={isLoading}
            onClick={handleCreateVersion}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateVersionDialog;
