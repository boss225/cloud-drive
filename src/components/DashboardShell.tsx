"use client";

import { useEffect } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import Breadcrumb from "./Breadcrumb";
import UploadProgress from "./UploadProgress";
import CreateFolderModal from "./CreateFolderModal";
import RenameModal from "./RenameModal";
import PreviewModal from "./PreviewModal";
import ContextMenu from "./ContextMenu";
import { FiMenu } from "react-icons/fi";
import Toast from "./Toast";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { fetchStats } = useFiles();
  const { setIsSidebarOpen } = useAppStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4 md:px-6 gap-3 md:gap-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <FiMenu size={20} />
          </button>
          <div className="hidden sm:block">
            <Breadcrumb />
          </div>
          <SearchBar />
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>

      {/* Overlays */}
      <UploadProgress />
      <CreateFolderModal />
      <RenameModal />
      <PreviewModal />
      <ContextMenu />
      <Toast />
    </div>
  );
}
