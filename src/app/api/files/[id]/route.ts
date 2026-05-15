import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteMessage } from "@/lib/telegram";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.starred !== undefined) updateData.starred = body.starred;
  if (body.restore) updateData.trashedAt = null;
  if (body.folderId !== undefined) updateData.folderId = body.folderId;

  const updated = await prisma.file.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const permanent = request.nextUrl.searchParams.get("permanent") === "true";

  const file = await prisma.file.findUnique({
    where: { id },
    include: { chunks: true },
  });

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

    await prisma.file.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: true });
  } else {
    // Soft delete - move to trash
    await prisma.file.update({
      where: { id },
      data: { trashedAt: new Date() },
    });
    return NextResponse.json({ success: true, trashed: true });
  }
}