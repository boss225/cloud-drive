import { NextRequest, NextResponse } from "next/server";
import { deleteFile, getFile, getFileWithChunks, updateFile } from "@/lib/db";
import { deleteMessage } from "@/lib/telegram";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = await getFile(id, user.id);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const updated = await updateFile(id, user.id, {
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = await getFileWithChunks(id, user.id);

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

    await deleteFile(id, user.id);
    return NextResponse.json({ success: true, deleted: true });
  } else {
    // Soft delete - move to trash
    await updateFile(id, user.id, { trashedAt: new Date() });
    return NextResponse.json({ success: true, trashed: true });
  }
}
