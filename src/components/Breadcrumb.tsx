"use client";

import { useAppStore } from "@/store/useAppStore";
import { useFiles } from "@/hooks/useFiles";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumb() {
  const { breadcrumbs } = useAppStore();
  const { navigateToBreadcrumb } = useFiles();

  return (
    <div className="flex items-center gap-1 text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <FiChevronRight className="text-gray-400" size={14} />}
          <button
            onClick={() => navigateToBreadcrumb(index)}
            className={`px-2 py-1 rounded-md transition ${
              index === breadcrumbs.length - 1
                ? "text-gray-800 font-semibold"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
}