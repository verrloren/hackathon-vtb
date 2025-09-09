"use client";

import { useState } from "react";
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
} from "@/shared";
import toast from "react-hot-toast";
import { useUpdateVersionMutation } from "@/features/versions/actions/use-update-version";

type EditVersionDialogProps = {
  trigger: React.ReactNode;
  projectId: string;
  tableId: string;
  versionId: string;
  currentCommitHash?: string;
  currentPrNumber?: number | null;
};

export function EditVersionDialog({
  trigger,
  projectId,
  tableId,
  versionId,
  currentCommitHash = "",
}: EditVersionDialogProps) {
  const [commitHash, setCommitHash] = useState(currentCommitHash ?? "");
  const { updateVersion, isLoading } = useUpdateVersionMutation();

  const closeDialog = () => {
    const btn = document.getElementById("edit-version-close-button");
    if (btn) (btn as HTMLButtonElement).click();
  };

  const handleSave = async () => {
    try {
      await updateVersion({ projectId, tableId, versionId, commit_hash: commitHash, pr_number: null });
      toast.success("Version updated");
      closeDialog();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update version");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="w-full py-8 bg-neutral-950 border-l-neutral-800 rounded-2xl flex flex-col justify-center overflow-hidden border-neutral-800 px-8 gap-y-8"
      >
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Edit version</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commit-hash">Commit hash</Label>
            <Input
              id="commit-hash"
              className="bg-neutral-900 text-white border-neutral-800 font-poppins rounded-xl placeholder:text-neutral-600 focus:bg-neutral-900 focus:border-neutral-600"
              placeholder="abcdef1"
              value={commitHash}
              onChange={(e) => setCommitHash(e.target.value)}
            />
          </div>

        </div>

        <DialogFooter className="flex flex-row items-center gap-x-4">
          <DialogClose
            id="edit-version-close-button"
            className="py-3 w-full text-base bg-transparent border border-neutral-800 hover:text-neutral-500 text-neutral-600 font-poppins rounded-2xl z-40 hover:border-neutral-800 transition-colors hover:brightness-125"
            type="button"
          >
            Cancel
          </DialogClose>
          <Button
            className="py-3 w-full text-base bg-white text-black font-poppins rounded-2xl z-40 transition-colors hover:bg-white/90 hover:border-white"
            type="button"
            disabled={isLoading}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditVersionDialog;

