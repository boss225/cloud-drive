import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const folderId = params.get("folderId");
  const root = params.get("root");
  const starred = params.get("starred");
  const trashed = params.get("trashed");
  const sortBy = params.get("sortBy") || "name";
  const sortOrder = (params.get("sortOrder") || "asc") as "asc" | "desc";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileWhere: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let folderWhere: any = {};

  if (trashed === "true") {
    fileWhere.trashedAt = { not: null };
    return NextResponse.json({
      files: await prisma.file.findMany({
        where: fileWhere,
        orderBy: { trashedAt: "desc" },
      }),
      folders: [],
    });
  }

  fileWhere.trashedAt = null;

  if (starred === "true") {
    fileWhere.starred = true;
    return NextResponse.json({
      files: await prisma.file.findMany({
        where: fileWhere,
        orderBy: getOrderBy(sortBy, sortOrder),
      }),
      folders: [],
    });
  }

  if (folderId) {
    fileWhere.folderId = folderId;
    folderWhere = { parentId: folderId };
  } else if (root === "true") {
    fileWhere.folderId = null;
    folderWhere = { parentId: null };
  }

  const [files, folders] = await Promise.all([
    prisma.file.findMany({
      where: fileWhere,
      orderBy: getOrderBy(sortBy, sortOrder),
    }),
    prisma.folder.findMany({
      where: folderWhere,
      include: {
        _count: {
          select: { files: true, children: true },
        },
      },
      orderBy: { name: sortOrder },
    }),
  ]);

  return NextResponse.json({ files, folders });
}

function getOrderBy(sortBy: string, sortOrder: "asc" | "desc") {
  switch (sortBy) {
    case "size":
      return { size: sortOrder } as const;
    case "date":
      return { createdAt: sortOrder } as const;
    default:
      return { name: sortOrder } as const;
  }
}