import { NextRequest, NextResponse } from "next/server";
import { listFiles, listFoldersWithCounts } from "@/lib/db";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json({ files: [], folders: [] });
  }

  const [files, folders] = await Promise.all([
    listFiles({ search: query, sortBy: "date", sortOrder: "desc", limit: 20 }),
    listFoldersWithCounts({ type: "search", query }, "asc", 10),
  ]);

  return NextResponse.json({ files, folders });
}
