"use client";

import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BreadcrumbItem } from "@/types";
import { useRouter, usePathname } from "next/navigation";

export function useFiles() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    currentFolderId,
    sidebarView,
    sortBy,
    sortOrder,
    setFiles,
    setFolders,
    setLoading,
    setStats,
    setCurrentFolder,
    breadcrumbs,
    addToast,
    clearSelection,
  } = useAppStore();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/files?";
      const params = new URLSearchParams();

      if (sidebarView === "starred") {
        params.set("starred", "true");
      } else if (sidebarView === "trash") {
        params.set("trashed", "true");
      } else if (currentFolderId) {
        params.set("folderId", currentFolderId);
      } else {
        params.set("root", "true");
      }

      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      url += params.toString();

      const res = await fetch(url);
      const data = await res.json();

      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Fetch files error:", error);
      addToast("Failed to fetch files", "error");
    } finally {
      setLoading(false);
    }
  }, [
    currentFolderId,
    sidebarView,
    sortBy,
    sortOrder,
    setFiles,
    setFolders,
    setLoading,
    addToast,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      setStats(data);
    } catch {
      /* ignore */
    }
  }, [setStats]);

  const fetchFolder = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/folders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentFolder(data.folder.id, data.breadcrumbs);
        }
      } catch {
        /* ignore */
      }
    },
    [setCurrentFolder]
  );

  const navigateToFolder = useCallback(
    async (folderId: string | null, folderName?: string) => {
      if (folderId === null) {
        router.push("/");
      } else {
        router.push(`/folder/${folderId}`);
      }
    },
    [router]
  );

  const navigateToBreadcrumb = useCallback(
    (index: number) => {
      const target = breadcrumbs[index];
      if (target.id === null) {
        router.push("/");
      } else {
        router.push(`/folder/${target.id}`);
      }
    },
    [breadcrumbs, router]
  );

  const deleteFile = useCallback(
    async (id: string, permanent: boolean = false) => {
      try {
        const url = permanent
          ? `/api/files/${id}?permanent=true`
          : `/api/files/${id}`;
        const res = await fetch(url, { method: "DELETE" });
        if (res.ok) {
          addToast(
            permanent ? "File deleted permanently" : "File moved to trash",
            "success"
          );
          fetchFiles();
          fetchStats();
        }
      } catch {
        addToast("Failed to delete file", "error");
      }
    },
    [addToast, fetchFiles, fetchStats]
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
        if (res.ok) {
          addToast("Folder deleted", "success");
          fetchFiles();
          fetchStats();
        }
      } catch {
        addToast("Failed to delete folder", "error");
      }
    },
    [addToast, fetchFiles, fetchStats]
  );

  const toggleStar = useCallback(
    async (id: string, starred: boolean) => {
      try {
        await fetch(`/api/files/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ starred: !starred }),
        });
        fetchFiles();
      } catch {
        addToast("Failed to update file", "error");
      }
    },
    [addToast, fetchFiles]
  );

  const restoreFile = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/files/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restore: true }),
        });
        addToast("File restored", "success");
        fetchFiles();
        fetchStats();
      } catch {
        addToast("Failed to restore file", "error");
      }
    },
    [addToast, fetchFiles, fetchStats]
  );

  const renameFile = useCallback(
    async (id: string, name: string) => {
      try {
        await fetch(`/api/files/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        addToast("File renamed", "success");
        fetchFiles();
      } catch {
        addToast("Failed to rename file", "error");
      }
    },
    [addToast, fetchFiles]
  );

  const renameFolder = useCallback(
    async (id: string, name: string) => {
      try {
        await fetch(`/api/folders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        addToast("Folder renamed", "success");
        fetchFiles();
      } catch {
        addToast("Failed to rename folder", "error");
      }
    },
    [addToast, fetchFiles]
  );

  const createFolder = useCallback(
    async (name: string, color?: string) => {
      try {
        const res = await fetch("/api/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            parentId: currentFolderId,
            color,
          }),
        });
        if (res.ok) {
          addToast("Folder created", "success");
          fetchFiles();
          fetchStats();
        }
      } catch {
        addToast("Failed to create folder", "error");
      }
    },
    [currentFolderId, addToast, fetchFiles, fetchStats]
  );

  const bulkDelete = useCallback(
    async (
      items: Array<{ id: string; type: "file" | "folder" }>,
      permanent: boolean = false
    ) => {
      try {
        await Promise.all(
          items.map(({ id, type }) =>
            type === "file"
              ? fetch(
                  permanent
                    ? `/api/files/${id}?permanent=true`
                    : `/api/files/${id}`,
                  { method: "DELETE" }
                )
              : fetch(`/api/folders/${id}`, { method: "DELETE" })
          )
        );
        addToast(
          `Deleted ${items.length} item${items.length > 1 ? "s" : ""}`,
          "success"
        );
        clearSelection();
        fetchFiles();
        fetchStats();
      } catch {
        addToast("Failed to delete some items", "error");
      }
    },
    [addToast, clearSelection, fetchFiles, fetchStats]
  );

  return {
    fetchFiles,
    fetchStats,
    fetchFolder,
    navigateToFolder,
    navigateToBreadcrumb,
    deleteFile,
    deleteFolder,
    bulkDelete,
    toggleStar,
    restoreFile,
    renameFile,
    renameFolder,
    createFolder,
  };
}