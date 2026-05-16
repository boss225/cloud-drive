import { NextRequest, NextResponse } from "next/server";
import { listFiles, listFoldersWithCounts, type SortBy, type SortOrder } from "@/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const folderId = params.get("folderId");
  const root = params.get("root");
  const starred = params.get("starred");
  const trashed = params.get("trashed");
  const sortBy = getSortBy(params.get("sortBy"));
  const sortOrder = getSortOrder(params.get("sortOrder"));

  if (trashed === "true") {
    return NextResponse.json({
      files: await listFiles({ trashed: true }),
      folders: [],
    });
  }

  if (starred === "true") {
    return NextResponse.json({
      files: await listFiles({ starred: true, sortBy, sortOrder }),
      folders: [],
    });
  }

  let targetFolderId: string | null | undefined;
  if (folderId) {
    targetFolderId = folderId;
  } else if (root === "true") {
    targetFolderId = null;
  }

  const [files, folders] = await Promise.all([
    listFiles(
      targetFolderId === undefined
        ? { sortBy, sortOrder }
        : { folderId: targetFolderId, sortBy, sortOrder }
    ),
    listFoldersWithCounts(
      targetFolderId === undefined
        ? { type: "all" }
        : { type: "parent", parentId: targetFolderId },
      sortOrder
    ),
  ]);

  return NextResponse.json({ files, folders });
}

function getSortBy(sortBy: string | null): SortBy {
  switch (sortBy) {
    case "size":
      return "size";
    case "date":
      return "date";
    default:
      return "name";
  }
}

function getSortOrder(sortOrder: string | null): SortOrder {
  return sortOrder === "desc" ? "desc" : "asc";
}
