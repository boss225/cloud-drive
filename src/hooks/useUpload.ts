"use client";

import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { generateId } from "@/lib/utils";
import { useFiles } from "./useFiles";

export function useUpload() {
  const { currentFolderId, addUpload, updateUpload, removeUpload, addToast } =
    useAppStore();
  const { fetchFiles, fetchStats } = useFiles();

  const uploadFile = useCallback(
    async (file: File) => {
      const uploadId = generateId();

      addUpload({
        id: uploadId,
        file,
        progress: 0,
        status: "pending",
      });

      try {
        updateUpload(uploadId, { status: "uploading", progress: 10 });

        const formData = new FormData();
        formData.append("file", file);
        if (currentFolderId) {
          formData.append("folderId", currentFolderId);
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          updateUpload(uploadId, {
            progress: Math.min(
              90,
              (useAppStore.getState().uploadQueue.find((u) => u.id === uploadId)
                ?.progress || 0) + 10
            ),
          });
        }, 500);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Upload failed");
        }

        updateUpload(uploadId, { status: "done", progress: 100 });
        addToast(`Uploaded: ${file.name}`, "success");

        setTimeout(() => removeUpload(uploadId), 3000);
        fetchFiles();
        fetchStats();
      } catch (error) {
        updateUpload(uploadId, {
          status: "error",
          error: (error as Error).message,
        });
        addToast(`Failed: ${file.name}`, "error");
        setTimeout(() => removeUpload(uploadId), 5000);
      }
    },
    [
      currentFolderId,
      addUpload,
      updateUpload,
      removeUpload,
      addToast,
      fetchFiles,
      fetchStats,
    ]
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  return { uploadFile, uploadFiles };
}