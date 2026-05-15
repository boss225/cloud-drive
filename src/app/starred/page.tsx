"use client";

import { useEffect } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useAppStore } from "@/store/useAppStore";
import FileList from "@/components/FileList";
import UploadZone from "@/components/UploadZone";

export default function StarredPage() {
  const { fetchFiles } = useFiles();
  const { sidebarView, sortBy, sortOrder, setSidebarView, setCurrentFolder } = useAppStore();

  useEffect(() => {
    setSidebarView("starred");
    setCurrentFolder(null, [{ id: null, name: "⭐ Starred" }]);
  }, [setSidebarView, setCurrentFolder]);

  useEffect(() => {
    if (sidebarView === "starred") {
      fetchFiles();
    }
  }, [sidebarView, sortBy, sortOrder, fetchFiles]);

  return (
    <UploadZone>
      <FileList />
    </UploadZone>
  );
}
