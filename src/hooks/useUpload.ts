"use client";

import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MAX_UPLOAD_QUEUE_SIZE } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { useFiles } from "./useFiles";
import type { UploadingFile } from "@/types";

type QueuedUpload = Pick<UploadingFile, "id" | "file">;

export function useUpload() {
  const { currentFolderId, addUpload, updateUpload, removeUpload, addToast } =
    useAppStore();
  const { fetchFiles, fetchStats } = useFiles();

  const uploadQueuedFile = useCallback(
    async ({ id: uploadId, file }: QueuedUpload) => {
      let progressInterval: ReturnType<typeof setInterval> | undefined;
      try {
        updateUpload(uploadId, { status: "uploading", progress: 10 });

        const formData = new FormData();
        formData.append("file", file);
        if (currentFolderId) {
          formData.append("folderId", currentFolderId);
        }

        // Simulate progress
        progressInterval = setInterval(() => {
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

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Upload failed");
        }

        updateUpload(uploadId, { status: "done", progress: 100 });
        addToast(`Uploaded: ${file.name}`, "success");

        setTimeout(() => removeUpload(uploadId), 3000);
        await Promise.all([fetchFiles(), fetchStats()]);
      } catch (error) {
        updateUpload(uploadId, {
          status: "error",
          error: (error as Error).message,
        });
        addToast(`Failed: ${file.name}`, "error");
        setTimeout(() => removeUpload(uploadId), 5000);
      } finally {
        if (progressInterval) clearInterval(progressInterval);
      }
    },
    [
      currentFolderId,
      updateUpload,
      removeUpload,
      addToast,
      fetchFiles,
      fetchStats,
    ]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      if (useAppStore.getState().uploadQueue.length >= MAX_UPLOAD_QUEUE_SIZE) {
        addToast(`Upload queue is limited to ${MAX_UPLOAD_QUEUE_SIZE} files`, "error");
        return;
      }

      const uploadId = generateId();

      addUpload({
        id: uploadId,
        file,
        progress: 0,
        status: "pending",
      });

      await uploadQueuedFile({ id: uploadId, file });
    },
    [addToast, addUpload, uploadQueuedFile]
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const selectedFiles = Array.from(files);
      const availableSlots =
        MAX_UPLOAD_QUEUE_SIZE - useAppStore.getState().uploadQueue.length;

      if (availableSlots <= 0) {
        addToast(`Upload queue is limited to ${MAX_UPLOAD_QUEUE_SIZE} files`, "error");
        return;
      }

      const fileArray = selectedFiles.slice(0, availableSlots);
      const skippedCount = selectedFiles.length - fileArray.length;

      if (skippedCount > 0) {
        addToast(
          `Added ${fileArray.length} file${
            fileArray.length === 1 ? "" : "s"
          }. ${skippedCount} file${skippedCount === 1 ? "" : "s"} skipped because the queue limit is ${MAX_UPLOAD_QUEUE_SIZE}.`,
          "info"
        );
      }

      const queuedUploads = fileArray.map((file) => ({
        id: generateId(),
        file,
      }));

      queuedUploads.forEach(({ id, file }) => {
        addUpload({
          id,
          file,
          progress: 0,
          status: "pending",
        });
      });

      for (const queuedUpload of queuedUploads) {
        const isStillQueued = useAppStore
          .getState()
          .uploadQueue.some((upload) => upload.id === queuedUpload.id);

        if (!isStillQueued) continue;

        await uploadQueuedFile(queuedUpload);
      }
    },
    [addToast, addUpload, uploadQueuedFile]
  );

  return { uploadFile, uploadFiles };
}
