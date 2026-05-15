import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json({ files: [], folders: [] });
  }

  const [files, folders] = await Promise.all([
    prisma.file.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",  // ← PostgreSQL case-insensitive
        },
        trashedAt: null,
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.folder.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",  // ← PostgreSQL case-insensitive
        },
      },
      take: 10,
      include: {
        _count: { select: { files: true, children: true } },
      },
    }),
  ]);

  return NextResponse.json({ files, folders });
}