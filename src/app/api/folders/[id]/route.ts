import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteMessage } from "@/lib/telegram";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const folder = await prisma.folder.findUnique({
    where: { id },
    include: {
      parent: true,
      _count: { select: { files: true, children: true } },
    },
  });

  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  // Build breadcrumb path
  const breadcrumbs = [{ id: folder.id, name: folder.name }];
  let currentParentId = folder.parentId;

  while (currentParentId) {
    const parent = await prisma.folder.findUnique({
      where: { id: currentParentId },
    });
    if (parent) {
      breadcrumbs.unshift({ id: parent.id, name: parent.name });
      currentParentId = parent.parentId;
    } else {
      break;
    }
  }

  breadcrumbs.unshift({ id: null, name: "My Drive" });

  return NextResponse.json({ folder, breadcrumbs });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const folder = await prisma.folder.findUnique({ where: { id } });
  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  const updated = await prisma.folder.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.color && { color: body.color }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Get all descendant folders recursively
  const getAllFolderIds = async (folderId: string): Promise<string[]> => {
    const ids = [folderId];
    const subfolders = await prisma.folder.findMany({
      where: { parentId: folderId },
      select: { id: true },
    });
    
    for (const sub of subfolders) {
      const subIds = await getAllFolderIds(sub.id);
      ids.push(...subIds);
    }
    return ids;
  };

  const allFolderIds = await getAllFolderIds(id);

  // Delete all files in these folders from Telegram
  const files = await prisma.file.findMany({
    where: { folderId: { in: allFolderIds } },
    include: { chunks: true },
  });

  for (const file of files) {
    try {
      await deleteMessage(file.telegramMsgId);
      for (const chunk of file.chunks) {
        await deleteMessage(chunk.telegramMsgId);
      }
    } catch (e) {
      console.error("Telegram delete error:", e);
    }
  }

  // Cascade delete in DB (folder + subfolders + files)
  await prisma.folder.delete({ where: { id } });

  return NextResponse.json({ success: true });
}