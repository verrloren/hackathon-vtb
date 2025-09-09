"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  Button,
} from "@/shared";
import { deleteVersionAction } from "@/features/versions/actions/delete-version-action";

type DeleteVersionDialogProps = {
  trigger: React.ReactNode;
  versionId: string;
  label?: string;
  onConfirm?: () => Promise<void>;
};

export function DeleteVersionDialog({ trigger, versionId, label, onConfirm }: DeleteVersionDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const closeDialog = () => {
    const btn = document.getElementById("delete-version-close-button");
    if (btn) (btn as HTMLButtonElement).click();
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      if (onConfirm) {
        await onConfirm();
        closeDialog();
        return;
      }
      const res = await deleteVersionAction(versionId);
      if (res?.success) {
        toast.success("Version deleted");
        closeDialog();
        router.refresh();
      } else {
        const msg = typeof res?.response === 'string' ? res.response : 'Failed to delete version';
        toast.error(msg);
      }
    } catch (e) {
      toast.error("Failed to delete version");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="w-full py-8 bg-neutral-950 border-l-neutral-800 rounded-2xl flex flex-col justify-center overflow-hidden border-neutral-800 px-8 gap-y-8"
      >
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Delete version?</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-neutral-600 font-poppins text-base">
          {label ? (
            <>You are about to delete <span className="text-white">{label}</span>. This action cannot be undone.</>
          ) : (
            <>This action cannot be undone.</>
          )}
        </DialogDescription>
        <DialogFooter className="flex flex-row items-center gap-x-4">
          <DialogClose
            id="delete-version-close-button"
            className="py-3 w-full text-base bg-transparent border border-neutral-800 hover:text-neutral-500 text-neutral-600 font-poppins rounded-2xl z-40 hover:border-neutral-800 transition-colors hover:brightness-125"
            type="button"
          >
            Cancel
          </DialogClose>
          <Button
            disabled={submitting}
            className="py-3 w-full text-base bg-red-600/75 text-white font-poppins rounded-2xl z-40 transition-colors hover:bg-red-600/90 hover:border-red-500"
            type="button"
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteVersionDialog;

