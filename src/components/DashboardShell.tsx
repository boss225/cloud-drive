"use client";

import { useEffect, useState, useRef } from "react";
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
import { FiMenu, FiLogOut, FiUser, FiLoader } from "react-icons/fi";
import Toast from "./Toast";
import type { User } from "@supabase/supabase-js";
import { useActionLoading } from "@/hooks/useActionLoading";

interface DashboardShellProps {
  children: React.ReactNode;
  user?: User;
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const { fetchStats } = useFiles();
  const { setIsSidebarOpen } = useAppStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { loading: isLoggingOut, run: handleLogout } = useActionLoading(async () => {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/";
  });

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
          <div className="flex-1 flex justify-end lg:justify-start">
            <SearchBar />
          </div>

          {user && (
            <div className="relative ml-auto" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:ring-2 hover:ring-blue-300 transition focus:outline-none overflow-hidden"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-10 h-10 object-cover" />
                ) : (
                  <FiUser size={20} />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    aria-busy={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 font-medium transition mt-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingOut ? (
                      <FiLoader size={18} className="animate-spin" />
                    ) : (
                      <FiLogOut size={18} />
                    )}
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
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
