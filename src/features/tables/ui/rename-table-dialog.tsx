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
import { useUpdateTableMutation } from "@/features/tables/actions/use-update-table";

export type RenameTableDialogProps = {
  trigger: React.ReactNode;
  tableId: string;
  currentName: string;
  projectId: string;
};

export function RenameTableDialog({ trigger, tableId, currentName, projectId }: RenameTableDialogProps) {
  const [name, setName] = useState(currentName ?? "");
  const { updateTable, isLoading } = useUpdateTableMutation();

  const closeDialog = () => {
    const btn = document.getElementById("rename-table-close-button");
    if (btn) (btn as HTMLButtonElement).click();
  };

  const handleRename = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;
    try {
      await updateTable({ projectId, tableId, name: trimmed });
      toast.success("Table updated");
      closeDialog();
    } catch (err) {
			console.log(err);
      toast.error("Failed to update table");
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
          <DialogTitle className="text-white text-2xl">Rename table</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="table-new-name">New name</Label>
          <Input
            id="table-new-name"
            className="bg-neutral-900 text-white border-neutral-800 font-poppins rounded-xl placeholder:text-neutral-600 focus:bg-neutral-900 focus:border-neutral-600"
            placeholder="orders_v2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <DialogFooter className="flex flex-row items-center gap-x-4">
          <DialogClose
            id="rename-table-close-button"
            className="py-3 w-full text-base bg-transparent border border-neutral-800 hover:text-neutral-500 text-neutral-600 font-poppins rounded-2xl z-40 hover:border-neutral-800 transition-colors hover:brightness-125"
            type="button"
          >
            Cancel
          </DialogClose>
          <Button
            className="py-3 w-full text-base bg-white text-black font-poppins rounded-2xl z-40 transition-colors hover:bg-white/90 hover:border-white"
            type="button"
            disabled={isLoading}
            onClick={handleRename}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RenameTableDialog;
