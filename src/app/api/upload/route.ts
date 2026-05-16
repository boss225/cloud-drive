import { NextRequest, NextResponse } from "next/server";
import { createFile, getFolder } from "@/lib/db";
import { sendDocument } from "@/lib/telegram";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "20971520");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as globalThis.File | null;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Verify folder exists if provided
    if (folderId) {
      const folder = await getFolder(folderId);
      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Telegram
    const caption = `📁 ${file.name}\n📏 ${(file.size / 1024).toFixed(1)} KB\n📅 ${new Date().toISOString()}`;
    const telegramMsg = await sendDocument(
      buffer,
      file.name,
      file.type || "application/octet-stream",
      caption
    );

    // Telegram may return different fields depending on detected media type
    const media =
      telegramMsg.document ??
      telegramMsg.video ??
      telegramMsg.audio ??
      telegramMsg.animation ??
      telegramMsg.voice ??
      telegramMsg.video_note;

    if (!media) {
      throw new Error("No media in Telegram response");
    }

    // Save to database
    const savedFile = await createFile({
      name: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      telegramFileId: media.file_id,
      telegramMsgId: telegramMsg.message_id,
      folderId: folderId || null,
    });

    return NextResponse.json({ success: true, file: savedFile });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
