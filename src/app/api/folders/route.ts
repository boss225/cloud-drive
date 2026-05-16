import { NextRequest, NextResponse } from "next/server";
import { createFolder, getFolder } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parentId, color } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Folder name required" },
        { status: 400 }
      );
    }

    if (parentId) {
      const parent = await getFolder(parentId);
      if (!parent) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }
    }

    const folder = await createFolder({
      name: name.trim(),
      parentId: parentId || null,
      color: color || "#FCD34D",
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
