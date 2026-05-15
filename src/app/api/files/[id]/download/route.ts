import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadFile } from "@/lib/telegram";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const file = await prisma.file.findUnique({
      where: { id },
      include: { chunks: { orderBy: { chunkIndex: "asc" } } },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    let fileBuffer: Buffer;

    if (file.chunks.length > 0) {
      // Chunked file: download all chunks and concatenate
      const chunkBuffers: Buffer[] = [];
      for (const chunk of file.chunks) {
        const buf = await downloadFile(chunk.telegramFileId);
        chunkBuffers.push(buf);
      }
      fileBuffer = Buffer.concat(chunkBuffers);
    } else {
      fileBuffer = await downloadFile(file.telegramFileId);
    }

    // Update download count
    await prisma.file.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}