import { NextRequest, NextResponse } from "next/server";
import { deleteFile, getFile, getFileWithChunks, updateFile } from "@/lib/db";
import { deleteMessage } from "@/lib/telegram";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const file = await getFile(id);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const updated = await updateFile(id, {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.starred !== undefined && { starred: body.starred }),
    ...(body.restore && { restore: true }),
    ...(body.folderId !== undefined && { folderId: body.folderId }),
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const permanent = request.nextUrl.searchParams.get("permanent") === "true";

  const file = await getFileWithChunks(id);

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (permanent) {
    // Delete from Telegram
    try {
      await deleteMessage(file.telegramMsgId);
      for (const chunk of file.chunks) {
        await deleteMessage(chunk.telegramMsgId);
      }
    } catch (e) {
      console.error("Failed to delete from Telegram:", e);
    }

    await deleteFile(id);
    return NextResponse.json({ success: true, deleted: true });
  } else {
    // Soft delete - move to trash
    await updateFile(id, { trashedAt: new Date() });
    return NextResponse.json({ success: true, trashed: true });
  }
}
