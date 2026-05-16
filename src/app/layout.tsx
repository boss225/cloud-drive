import type { Metadata } from "next";
import "./globals.css";
import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/utils/supabase/server";
import Login from "@/components/Login";

export const metadata: Metadata = {
  title: "Top Cloud Drive",
  description: "Free unlimited file storage powered by TCD",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <html lang="en">
      <body className="antialiased">
        {user ? (
          <DashboardShell user={user}>{children}</DashboardShell>
        ) : (
          <Login />
        )}
      </body>
    </html>
  );
}
