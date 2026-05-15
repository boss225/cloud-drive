"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import {
  FiDownload,
  FiEdit2,
  FiStar,
  FiTrash2,
  FiEye,
  FiRotateCcw,
} from "react-icons/fi";
import { FileItem, FolderItem } from "@/types";
import { isPreviewable } from "@/lib/utils";

export default function ContextMenu() {
  const { contextMenu, setContextMenu, setShowRename, setPreviewFile, sidebarView } =
    useAppStore();
  const { deleteFile, deleteFolder, toggleStar, restoreFile } = useFiles();

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
              onClick={() => {
                setPreviewFile(item as FileItem);
                setContextMenu({
                  visible: false,
                  x: 0,
                  y: 0,
                  type: null,
                  item: null,
                });
              }}
            />
          )}
          <MenuItem
            icon={<FiDownload size={16} />}
            label="Download"
            onClick={() => {
              window.open(`/api/files/${item.id}/download`, "_blank");
              setContextMenu({
                visible: false,
                x: 0,
                y: 0,
                type: null,
                item: null,
              });
            }}
          />
          <MenuItem
            icon={<FiStar size={16} />}
            label={
              (item as FileItem).starred ? "Remove star" : "Add star"
            }
            onClick={() => {
              toggleStar(item.id, (item as FileItem).starred);
              setContextMenu({
                visible: false,
                x: 0,
                y: 0,
                type: null,
                item: null,
              });
            }}
          />
        </>
      )}

      {!isTrashView && (
        <MenuItem
          icon={<FiEdit2 size={16} />}
          label="Rename"
          onClick={() => {
            setShowRename({
              type: isFile ? "file" : "folder",
              item,
            });
            setContextMenu({
              visible: false,
              x: 0,
              y: 0,
              type: null,
              item: null,
            });
          }}
        />
      )}

      {isTrashView && isFile && (
        <MenuItem
          icon={<FiRotateCcw size={16} />}
          label="Restore"
          onClick={() => {
            restoreFile(item.id);
            setContextMenu({
              visible: false,
              x: 0,
              y: 0,
              type: null,
              item: null,
            });
          }}
        />
      )}

      <div className="h-px bg-gray-100 my-1" />

      <MenuItem
        icon={<FiTrash2 size={16} />}
        label={isTrashView ? "Delete permanently" : "Delete"}
        danger
        onClick={() => {
          if (isFile) {
            deleteFile(item.id, isTrashView);
          } else {
            deleteFolder(item.id);
          }
          setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            type: null,
            item: null,
          });
        }}
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}