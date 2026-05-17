"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import {
  FiDownload,
  FiEdit2,
  FiStar,
  FiTrash2,
  FiEye,
  FiRotateCcw,
  FiLoader,
} from "react-icons/fi";
import { FileItem } from "@/types";
import { isPreviewable } from "@/lib/utils";

export default function ContextMenu() {
  const { contextMenu, setContextMenu, setShowRename, setPreviewFile, sidebarView } =
    useAppStore();
  const { deleteFile, deleteFolder, toggleStar, restoreFile } = useFiles();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    const handler = () =>
      setContextMenu({ visible: false, x: 0, y: 0, type: null, item: null });
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [setContextMenu]);

  if (!contextMenu.visible || !contextMenu.item) return null;

  const isFile = contextMenu.type === "file";
  const item = contextMenu.item;
  const isTrashView = sidebarView === "trash";
  const isActionPending = pendingAction !== null;

  const closeMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      type: null,
      item: null,
    });
  };

  const runMenuAction = async (actionId: string, action: () => Promise<void>) => {
    if (pendingAction) return;

    setPendingAction(actionId);
    try {
      await action();
      closeMenu();
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[200px] z-50"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {isFile && !isTrashView && (
        <>
          {isPreviewable((item as FileItem).mimeType) && (
            <MenuItem
              icon={<FiEye size={16} />}
              label="Preview"
              disabled={isActionPending}
              onClick={() => {
                setPreviewFile(item as FileItem);
                closeMenu();
              }}
            />
          )}
          <MenuItem
            icon={<FiDownload size={16} />}
            label="Download"
            disabled={isActionPending}
            onClick={() => {
              window.open(`/api/files/${item.id}/download`, "_blank");
              closeMenu();
            }}
          />
          <MenuItem
            icon={<FiStar size={16} />}
            label={
              (item as FileItem).starred ? "Remove star" : "Add star"
            }
            loading={pendingAction === "star"}
            disabled={isActionPending}
            onClick={() =>
              runMenuAction("star", () =>
                toggleStar(item.id, (item as FileItem).starred)
              )
            }
          />
        </>
      )}

      {!isTrashView && (
        <MenuItem
          icon={<FiEdit2 size={16} />}
          label="Rename"
          disabled={isActionPending}
          onClick={() => {
            setShowRename({
              type: isFile ? "file" : "folder",
              item,
            });
            closeMenu();
          }}
        />
      )}

      {isTrashView && isFile && (
        <MenuItem
          icon={<FiRotateCcw size={16} />}
          label="Restore"
          loading={pendingAction === "restore"}
          disabled={isActionPending}
          onClick={() => runMenuAction("restore", () => restoreFile(item.id))}
        />
      )}

      <div className="h-px bg-gray-100 my-1" />

      <MenuItem
        icon={<FiTrash2 size={16} />}
        label={isTrashView ? "Delete permanently" : "Delete"}
        danger
        loading={pendingAction === "delete"}
        disabled={isActionPending}
        onClick={() =>
          runMenuAction("delete", () =>
            isFile ? deleteFile(item.id, isTrashView) : deleteFolder(item.id)
          )
        }
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
  loading,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {loading ? <FiLoader size={16} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
