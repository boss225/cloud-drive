const BOT_TOKEN = process.env.BOT_TOKEN!;
const CHANNEL_ID = process.env.CHANNEL_ID!;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramMediaItem {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface TelegramMessage {
  message_id: number;
  document?: TelegramMediaItem;
  video?: TelegramMediaItem;
  audio?: TelegramMediaItem;
  animation?: TelegramMediaItem;
  voice?: TelegramMediaItem;
  video_note?: TelegramMediaItem;
  photo?: Array<{ file_id: string; file_size?: number }>;
}

interface TelegramResponse<T = TelegramMessage> {
  ok: boolean;
  result: T;
  description?: string;
}

export async function sendDocument(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  caption?: string
): Promise<TelegramMessage> {
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimeType });

  formData.append("chat_id", CHANNEL_ID);
  formData.append("document", blob, fileName);
  if (caption) {
    formData.append("caption", caption);
  }

  const res = await fetch(`${API_BASE}/sendDocument`, {
    method: "POST",
    body: formData,
  });

  const data: TelegramResponse = await res.json();

  if (!data.ok) {
    throw new Error(`Telegram error: ${data.description || "Unknown error"}`);
  }

  return data.result;
}

export async function getFileDownloadUrl(fileId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/getFile?file_id=${fileId}`);
  const data: TelegramResponse<{ file_path: string }> = await res.json();

  if (!data.ok) {
    throw new Error(`Telegram error: ${data.description}`);
  }

  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const url = await getFileDownloadUrl(fileId);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to download from Telegram");
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function deleteMessage(messageId: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      message_id: messageId,
    }),
  });

  const data: TelegramResponse<boolean> = await res.json();
  return data.ok;
}