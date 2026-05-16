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
import { createClient } from "@/utils/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folder = await getFolderWithParentAndCounts(id, user.id);

  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  // Build breadcrumb path
  const breadcrumbs: BreadcrumbItem[] = [{ id: folder.id, name: folder.name }];
  let currentParentId = folder.parentId;

  while (currentParentId) {
    const parent = await getFolder(currentParentId, user.id);
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folder = await getFolder(id, user.id);
  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  const updated = await updateFolder(id, user.id, {
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allFolderIds = await getDescendantFolderIds(id, user.id);
  if (allFolderIds.length === 0) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  // Delete all files in these folders from Telegram
  const files = await listFilesWithChunksInFolders(allFolderIds, user.id);

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

  await deleteFoldersByIds(allFolderIds, user.id);

  return NextResponse.json({ success: true });
}
