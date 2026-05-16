import { NextRequest, NextResponse } from "next/server";
import { listFiles, listFoldersWithCounts } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json({ files: [], folders: [] });
  }

  const [files, folders] = await Promise.all([
    listFiles({ userId: user.id, search: query, sortBy: "date", sortOrder: "desc", limit: 20 }),
    listFoldersWithCounts({ type: "search", query }, user.id, "asc", 10),
  ]);

  return NextResponse.json({ files, folders });
}
