import type { Metadata } from "next";
import "./globals.css";
import DashboardShell from "@/components/DashboardShell";

export const metadata: Metadata = {
  title: "Telegram Cloud Drive",
  description: "Free unlimited file storage powered by Telegram",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}