"use client";

import "filepond/dist/filepond.min.css";
import { useRef, useState } from "react";
import { FilePond } from "react-filepond";
import { type FilePondFile } from "filepond";
import { AnimatePresence, motion } from "framer-motion";

interface UploadProjectsProps {
  onFilesUpdate: (files: File[]) => void;
}

export function UploadProjects({ onFilesUpdate }: UploadProjectsProps) {
  const pondRef = useRef<FilePond>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleFilesUpdate = (fileItems: FilePondFile[]) => {
    // Convert FilePond files to regular Files
    const files = fileItems.map((fileItem) => fileItem.file as File);

    // Update parent component
    onFilesUpdate(files);

    // Update local state
    setIsUploaded(files.length > 0);
  };

  return (
    <div
      onClick={() => pondRef.current?.browse()}
      className="relative radial-ellipse-upload-project-files 
    	w-[35rem] aspect-square rounded-full 
    	cursor-pointer bg-neutral-950 border border-neutral-900"
    >
      <div
        className={`absolute inset-0 ${
          isUploaded ? "overflow-y-auto" : "overflow-hidden"
        }`}
      >
        <FilePond
          ref={pondRef}
          onupdatefiles={handleFilesUpdate}
          allowMultiple={true}
          maxFiles={200}
          name="files"
          className="absolute left-0 top-0 w-full h-full z-50"
          dropOnPage={false}
          dropOnElement={true}
          instantUpload={false}
          allowRevert={false}
          allowProcess={false}
          labelIdle="tap"
        />
      </div>

      <AnimatePresence>
        {!isUploaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          text-neutral-200 text-xl z-50 pointer-events-none"
          >
            Browse
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
