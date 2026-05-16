CREATE TABLE IF NOT EXISTS "Folder" (
  id text PRIMARY KEY,
  name text NOT NULL,
  "parentId" text REFERENCES "Folder"(id) ON DELETE CASCADE,
  color text NOT NULL DEFAULT '#FCD34D',
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Folder_parentId_idx" ON "Folder"("parentId");

CREATE TABLE IF NOT EXISTS "File" (
  id text PRIMARY KEY,
  name text NOT NULL,
  "originalName" text NOT NULL,
  size integer NOT NULL,
  "mimeType" text NOT NULL,
  "telegramFileId" text NOT NULL,
  "telegramMsgId" integer NOT NULL,
  "folderId" text REFERENCES "Folder"(id) ON DELETE CASCADE,
  starred boolean NOT NULL DEFAULT false,
  "trashedAt" timestamp(3) without time zone,
  downloads integer NOT NULL DEFAULT 0,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "totalChunks" integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS "File_folderId_idx" ON "File"("folderId");
CREATE INDEX IF NOT EXISTS "File_starred_idx" ON "File"(starred);
CREATE INDEX IF NOT EXISTS "File_trashedAt_idx" ON "File"("trashedAt");
CREATE INDEX IF NOT EXISTS "File_name_idx" ON "File"(name);

CREATE TABLE IF NOT EXISTS "FileChunk" (
  id text PRIMARY KEY,
  "fileId" text NOT NULL REFERENCES "File"(id) ON DELETE CASCADE,
  "chunkIndex" integer NOT NULL,
  "telegramFileId" text NOT NULL,
  "telegramMsgId" integer NOT NULL,
  size integer NOT NULL,
  CONSTRAINT "FileChunk_fileId_chunkIndex_key" UNIQUE ("fileId", "chunkIndex")
);

CREATE INDEX IF NOT EXISTS "FileChunk_fileId_idx" ON "FileChunk"("fileId");
