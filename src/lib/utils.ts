import { FILE_ICONS } from "./constants";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(mimeType: string): string {
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (key === "default") continue;
    if (mimeType.startsWith(key) || mimeType === key) return icon;
  }
  return FILE_ICONS.default;
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toUpperCase() || "FILE";
}

export function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/") ||
    mimeType === "application/pdf" ||
    mimeType.startsWith("text/") ||
    mimeType === "application/json"
  );
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function truncateFileName(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) return name;
  const ext = name.split(".").pop() || "";
  const nameWithoutExt = name.slice(0, name.length - ext.length - 1);
  const truncated = nameWithoutExt.slice(0, maxLength - ext.length - 4);
  return `${truncated}...${ext}`;
}