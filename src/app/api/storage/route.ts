import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalFiles, totalFolders, starredFiles, trashedFiles, sizeResult] =
      await Promise.all([
        prisma.file.count({ where: { trashedAt: null } }),
        prisma.folder.count(),
        prisma.file.count({ where: { starred: true, trashedAt: null } }),
        prisma.file.count({ where: { trashedAt: { not: null } } }),
        prisma.file.aggregate({ _sum: { size: true } }),
      ]);

    return NextResponse.json({
      totalFiles,
      totalFolders,
      starredFiles,
      trashedFiles,
      totalSize: sizeResult._sum.size || 0,
    });
  } catch (error) {
    console.error("Failed to fetch storage stats", error);

    return NextResponse.json(
      { error: "Failed to fetch storage stats" },
      { status: 500 },
    );
  }
}
