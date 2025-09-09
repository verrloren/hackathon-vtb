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
import { useCreateTableMutation } from "@/features/tables/actions/use-create-table";

type CreateTableDialogProps = {
  trigger: React.ReactNode;
  projectId: string;
};

export function CreateTableDialog({ trigger, projectId }: CreateTableDialogProps) {
  const [tableName, setTableName] = useState("");
  const [connectionString, setConnectionString] = useState("");
  const { createTable, isLoading } = useCreateTableMutation();

  const closeDialog = () => {
    const btn = document.getElementById("dialog-close-button");
    if (btn) (btn as HTMLButtonElement).click();
  };

  const handleCreateTable = async () => {
    if (!tableName || !connectionString) {
      toast.error("Please provide table name and connection string");
      return;
    }

    const isPg = /^postgresql:\/\//i.test(connectionString.trim());
    if (!isPg) {
      toast.error('Connection string must start with "postgresql://"');
      return;
    }

    try {
      await createTable({
        projectId,
        name: tableName,
        connection_string: connectionString.trim(),
        schema: "public",
      });
      toast.success("Table created");
      setTableName("");
      setConnectionString("");
      closeDialog();
    } catch {
      toast.error("Failed to create table");
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
            New table
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            onClick={handleCreateTable}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTableDialog;
