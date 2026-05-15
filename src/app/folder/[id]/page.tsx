"use client";

import { useEffect, use } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useAppStore } from "@/store/useAppStore";
import FileList from "@/components/FileList";
import UploadZone from "@/components/UploadZone";

export default function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { fetchFiles, fetchFolder } = useFiles();
  const { currentFolderId, sidebarView, sortBy, sortOrder, setSidebarView } = useAppStore();

  useEffect(() => {
    setSidebarView("files");
    fetchFolder(id);
  }, [id, setSidebarView, fetchFolder]);

  useEffect(() => {
    if (currentFolderId === id) {
      fetchFiles();
    }
  }, [id, currentFolderId, sidebarView, sortBy, sortOrder, fetchFiles]);

  return (
    <UploadZone>
      <FileList />
    </UploadZone>
  );
}
