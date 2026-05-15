"use client";

import { useEffect } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useAppStore } from "@/store/useAppStore";
import FileList from "@/components/FileList";
import UploadZone from "@/components/UploadZone";

export default function TrashPage() {
  const { fetchFiles } = useFiles();
  const { sidebarView, sortBy, sortOrder, setSidebarView, setCurrentFolder } = useAppStore();

  useEffect(() => {
    setSidebarView("trash");
    setCurrentFolder(null, [{ id: null, name: "🗑️ Trash" }]);
  }, [setSidebarView, setCurrentFolder]);

  useEffect(() => {
    if (sidebarView === "trash") {
      fetchFiles();
    }
  }, [sidebarView, sortBy, sortOrder, fetchFiles]);

  return (
    <UploadZone>
      <FileList />
    </UploadZone>
  );
}
