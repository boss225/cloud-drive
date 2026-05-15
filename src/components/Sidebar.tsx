"use client";

import Image from "next/image";
import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import { formatFileSize } from "@/lib/utils";
import {
  FiFolder,
  FiStar,
  FiTrash2,
  FiPlus,
  FiHardDrive,
} from "react-icons/fi";
import type { SidebarView } from "@/types";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const {
    sidebarView,
    setSidebarView,
    stats,
    setShowCreateFolder,
    setCurrentFolder,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useAppStore();
  const { fetchFiles } = useFiles();
  const router = useRouter();
  const pathname = usePathname();

  const handleViewChange = (view: SidebarView) => {
    setIsSidebarOpen(false);
    if (view === "files") {
      router.push("/");
    } else {
      router.push(`/${view}`);
    }
  };

  const menuItems: {
    view: SidebarView;
    icon: React.ReactNode;
    label: string;
    count?: number;
  }[] = [
    {
      view: "files",
      icon: <FiFolder size={20} />,
      label: "My Drive",
      count: stats?.totalFiles,
    },
    {
      view: "starred",
      icon: <FiStar size={20} />,
      label: "Starred",
      count: stats?.starredFiles,
    },
    {
      view: "trash",
      icon: <FiTrash2 size={20} />,
      label: "Trash",
      count: stats?.trashedFiles,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col h-screen flex-shrink-0 overflow-hidden z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      <div className="flex items-center gap-3 px-5 py-4 justify-between">
        <Image
          src="/logo_tcd.png"
          alt="Telegram Cloud Drive"
          width={36}
          height={36}
          className="rounded-lg object-contain"
          priority
          onClick={() => router.push("/")}
        />
        <button
          onClick={() => setShowCreateFolder(true)}
          className=" items-center px-2 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100"
        >
          <FiPlus size={20} />
        </button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => handleViewChange(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition text-left ${
              sidebarView === item.view
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Storage Info */}
      {stats && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FiHardDrive size={16} />
            <span className="text-sm font-medium">Storage</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {formatFileSize(stats.totalSize)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.totalFiles} files • {stats.totalFolders} folders
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{
                width: `${Math.min((stats.totalSize / (2 * 1024 * 1024 * 1024)) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">∞ unlimited</div>
        </div>
      )}
    </aside>
    </>
  );
}
