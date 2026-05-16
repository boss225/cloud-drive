import { NextRequest, NextResponse } from "next/server";
import {
  deleteFoldersByIds,
  getDescendantFolderIds,
  getFolder,
  getFolderWithParentAndCounts,
  listFilesWithChunksInFolders,
  updateFolder,
} from "@/lib/db";
import { deleteMessage } from "@/lib/telegram";
import { BreadcrumbItem } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const folder = await getFolderWithParentAndCounts(id);

  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  // Build breadcrumb path
  const breadcrumbs: BreadcrumbItem[] = [{ id: folder.id, name: folder.name }];
  let currentParentId = folder.parentId;

  while (currentParentId) {
    const parent = await getFolder(currentParentId);
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

  const folder = await getFolder(id);
  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  const updated = await updateFolder(id, {
    ...(body.name && { name: body.name }),
    ...(body.color && { color: body.color }),
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const allFolderIds = await getDescendantFolderIds(id);
  if (allFolderIds.length === 0) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  // Delete all files in these folders from Telegram
  const files = await listFilesWithChunksInFolders(allFolderIds);

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

  await deleteFoldersByIds(allFolderIds);

  return NextResponse.json({ success: true });
}
