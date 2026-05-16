import { randomUUID } from "crypto";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

export interface FileRecord {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  telegramFileId: string;
  telegramMsgId: number;
  folderId: string | null;
  starred: boolean;
  trashedAt: Date | null;
  downloads: number;
  totalChunks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileChunkRecord {
  id: string;
  fileId: string;
  chunkIndex: number;
  telegramFileId: string;
  telegramMsgId: number;
  size: number;
}

export interface FolderRecord {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    files: number;
    children: number;
  };
}

export type FileWithChunks = FileRecord & { chunks: FileChunkRecord[] };
export type FolderWithParent = FolderRecord & { parent: FolderRecord | null };
export type SortBy = "name" | "size" | "date";
export type SortOrder = "asc" | "desc";

const globalForDb = globalThis as unknown as {
  dbPool: Pool | undefined;
};

function getDbPool() {
  if (globalForDb.dbPool) {
    return globalForDb.dbPool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const usesSupabaseSsl =
    process.env.SUPABASE_DB_SSL === "true" ||
    /supabase\.(co|com)/i.test(connectionString);

  const pool = new Pool({
    connectionString,
    ssl: usesSupabaseSsl ? { rejectUnauthorized: false } : undefined,
  });

  globalForDb.dbPool = pool;

  return pool;
}

async function query<T>(
  text: string,
  params: unknown[] = [],
  client: Pool | PoolClient = getDbPool()
) {
  return client.query<T & QueryResultRow>(text, params);
}

const fileSelect = `
  id,
  name,
  "originalName",
  size,
  "mimeType",
  "telegramFileId",
  "telegramMsgId",
  "folderId",
  starred,
  "trashedAt",
  downloads,
  "totalChunks",
  "createdAt",
  "updatedAt"
`;

const folderSelect = `
  id,
  name,
  "parentId",
  color,
  "createdAt",
  "updatedAt"
`;

const chunkSelect = `
  id,
  "fileId",
  "chunkIndex",
  "telegramFileId",
  "telegramMsgId",
  size
`;

function folderSelectForAlias(alias: string) {
  return `
    ${alias}.id,
    ${alias}.name,
    ${alias}."parentId",
    ${alias}.color,
    ${alias}."createdAt",
    ${alias}."updatedAt"
  `;
}

function orderByClause(sortBy: SortBy, sortOrder: SortOrder) {
  const direction = sortOrder === "desc" ? "DESC" : "ASC";

  switch (sortBy) {
    case "size":
      return `"size" ${direction}`;
    case "date":
      return `"createdAt" ${direction}`;
    default:
      return `"name" ${direction}`;
  }
}

function mapFolderWithCount(
  row: FolderRecord & { filesCount: string | number; childrenCount: string | number }
): FolderRecord {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    color: row.color,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    _count: {
      files: Number(row.filesCount),
      children: Number(row.childrenCount),
    },
  };
}

export async function getFolder(id: string) {
  const { rows } = await query<FolderRecord>(
    `SELECT ${folderSelect} FROM "Folder" WHERE id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function getFolderWithParentAndCounts(id: string) {
  const { rows } = await query<
    FolderRecord & {
      filesCount: string | number;
      childrenCount: string | number;
      parentIdValue: string | null;
      parentName: string | null;
      parentParentId: string | null;
      parentColor: string | null;
      parentCreatedAt: Date | null;
      parentUpdatedAt: Date | null;
    }
  >(
    `
      SELECT
        ${folderSelectForAlias("f")},
        (
          SELECT COUNT(*) FROM "File" file_count WHERE file_count."folderId" = f.id
        )::int AS "filesCount",
        (
          SELECT COUNT(*) FROM "Folder" child_count WHERE child_count."parentId" = f.id
        )::int AS "childrenCount",
        p.id AS "parentIdValue",
        p.name AS "parentName",
        p."parentId" AS "parentParentId",
        p.color AS "parentColor",
        p."createdAt" AS "parentCreatedAt",
        p."updatedAt" AS "parentUpdatedAt"
      FROM "Folder" f
      LEFT JOIN "Folder" p ON p.id = f."parentId"
      WHERE f.id = $1
    `,
    [id]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const folder = mapFolderWithCount(row);

  return {
    ...folder,
    parent: row.parentIdValue
      ? {
          id: row.parentIdValue,
          name: row.parentName ?? "",
          parentId: row.parentParentId,
          color: row.parentColor ?? "#FCD34D",
          createdAt: row.parentCreatedAt ?? new Date(0),
          updatedAt: row.parentUpdatedAt ?? new Date(0),
        }
      : null,
  } satisfies FolderWithParent;
}

export async function listFoldersWithCounts(
  where:
    | { type: "parent"; parentId: string | null }
    | { type: "search"; query: string }
    | { type: "all" },
  sortOrder: SortOrder = "asc",
  limit?: number
) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (where.type === "parent") {
    if (where.parentId === null) {
      conditions.push(`f."parentId" IS NULL`);
    } else {
      values.push(where.parentId);
      conditions.push(`f."parentId" = $${values.length}`);
    }
  }

  if (where.type === "search") {
    values.push(`%${where.query}%`);
    conditions.push(`f.name ILIKE $${values.length}`);
  }

  const direction = sortOrder === "desc" ? "DESC" : "ASC";
  const limitClause = limit ? `LIMIT ${limit}` : "";
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query<
    FolderRecord & { filesCount: string | number; childrenCount: string | number }
  >(
    `
      SELECT
        ${folderSelectForAlias("f")},
        (
          SELECT COUNT(*) FROM "File" file_count WHERE file_count."folderId" = f.id
        )::int AS "filesCount",
        (
          SELECT COUNT(*) FROM "Folder" child_count WHERE child_count."parentId" = f.id
        )::int AS "childrenCount"
      FROM "Folder" f
      ${whereClause}
      ORDER BY f.name ${direction}
      ${limitClause}
    `,
    values
  );

  return rows.map(mapFolderWithCount);
}

export async function createFolder(data: {
  name: string;
  parentId: string | null;
  color: string;
}) {
  const { rows } = await query<FolderRecord>(
    `
      INSERT INTO "Folder" (
        id, name, "parentId", color, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING ${folderSelect}
    `,
    [randomUUID(), data.name, data.parentId, data.color]
  );

  return rows[0];
}

export async function updateFolder(
  id: string,
  data: { name?: string; color?: string }
) {
  const assignments: string[] = [`"updatedAt" = NOW()`];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    values.push(data.name);
    assignments.push(`name = $${values.length}`);
  }

  if (data.color !== undefined) {
    values.push(data.color);
    assignments.push(`color = $${values.length}`);
  }

  values.push(id);

  const { rows } = await query<FolderRecord>(
    `
      UPDATE "Folder"
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING ${folderSelect}
    `,
    values
  );

  return rows[0] ?? null;
}

export async function getDescendantFolderIds(id: string) {
  const { rows } = await query<{ id: string }>(
    `
      WITH RECURSIVE descendants AS (
        SELECT id FROM "Folder" WHERE id = $1
        UNION ALL
        SELECT f.id
        FROM "Folder" f
        INNER JOIN descendants d ON f."parentId" = d.id
      )
      SELECT id FROM descendants
    `,
    [id]
  );

  return rows.map((row) => row.id);
}

export async function deleteFoldersByIds(ids: string[]) {
  if (ids.length === 0) {
    return;
  }

  const client = await getDbPool().connect();

  try {
    await client.query("BEGIN");
    await query(
      `
        DELETE FROM "FileChunk"
        WHERE "fileId" IN (
          SELECT id FROM "File" WHERE "folderId" = ANY($1::text[])
        )
      `,
      [ids],
      client
    );
    await query(`DELETE FROM "File" WHERE "folderId" = ANY($1::text[])`, [ids], client);
    await query(`DELETE FROM "Folder" WHERE id = ANY($1::text[])`, [ids], client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getFile(id: string) {
  const { rows } = await query<FileRecord>(
    `SELECT ${fileSelect} FROM "File" WHERE id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function getFileWithChunks(id: string) {
  const file = await getFile(id);
  if (!file) {
    return null;
  }

  const chunks = await getFileChunks(id);

  return { ...file, chunks } satisfies FileWithChunks;
}

export async function getFileChunks(fileId: string) {
  const { rows } = await query<FileChunkRecord>(
    `
      SELECT ${chunkSelect}
      FROM "FileChunk"
      WHERE "fileId" = $1
      ORDER BY "chunkIndex" ASC
    `,
    [fileId]
  );

  return rows;
}

export async function listFiles(options: {
  folderId?: string | null;
  trashed?: boolean;
  starred?: boolean;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  search?: string;
  limit?: number;
}) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (options.trashed) {
    conditions.push(`"trashedAt" IS NOT NULL`);
  } else {
    conditions.push(`"trashedAt" IS NULL`);
  }

  if (options.starred) {
    conditions.push(`starred = TRUE`);
  }

  if (Object.prototype.hasOwnProperty.call(options, "folderId")) {
    if (options.folderId === null) {
      conditions.push(`"folderId" IS NULL`);
    } else {
      values.push(options.folderId);
      conditions.push(`"folderId" = $${values.length}`);
    }
  }

  if (options.search) {
    values.push(`%${options.search}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }

  const order =
    options.trashed && !options.search
      ? `"trashedAt" DESC`
      : orderByClause(options.sortBy ?? "name", options.sortOrder ?? "asc");
  const limitClause = options.limit ? `LIMIT ${options.limit}` : "";

  const { rows } = await query<FileRecord>(
    `
      SELECT ${fileSelect}
      FROM "File"
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${order}
      ${limitClause}
    `,
    values
  );

  return rows;
}

export async function createFile(data: {
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  telegramFileId: string;
  telegramMsgId: number;
  folderId: string | null;
}) {
  const { rows } = await query<FileRecord>(
    `
      INSERT INTO "File" (
        id,
        name,
        "originalName",
        size,
        "mimeType",
        "telegramFileId",
        "telegramMsgId",
        "folderId",
        starred,
        "trashedAt",
        downloads,
        "totalChunks",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, NULL, 0, 1, NOW(), NOW())
      RETURNING ${fileSelect}
    `,
    [
      randomUUID(),
      data.name,
      data.originalName,
      data.size,
      data.mimeType,
      data.telegramFileId,
      data.telegramMsgId,
      data.folderId,
    ]
  );

  return rows[0];
}

export async function updateFile(
  id: string,
  data: {
    name?: string;
    starred?: boolean;
    restore?: boolean;
    folderId?: string | null;
    trashedAt?: Date | null;
  }
) {
  const assignments: string[] = [`"updatedAt" = NOW()`];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    values.push(data.name);
    assignments.push(`name = $${values.length}`);
  }

  if (data.starred !== undefined) {
    values.push(data.starred);
    assignments.push(`starred = $${values.length}`);
  }

  if (data.restore) {
    assignments.push(`"trashedAt" = NULL`);
  }

  if (Object.prototype.hasOwnProperty.call(data, "folderId")) {
    values.push(data.folderId ?? null);
    assignments.push(`"folderId" = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(data, "trashedAt")) {
    values.push(data.trashedAt);
    assignments.push(`"trashedAt" = $${values.length}`);
  }

  values.push(id);

  const { rows } = await query<FileRecord>(
    `
      UPDATE "File"
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING ${fileSelect}
    `,
    values
  );

  return rows[0] ?? null;
}

export async function incrementFileDownloads(id: string) {
  await query(
    `
      UPDATE "File"
      SET downloads = downloads + 1, "updatedAt" = NOW()
      WHERE id = $1
    `,
    [id]
  );
}

export async function deleteFile(id: string) {
  const client = await getDbPool().connect();

  try {
    await client.query("BEGIN");
    await query(`DELETE FROM "FileChunk" WHERE "fileId" = $1`, [id], client);
    await query(`DELETE FROM "File" WHERE id = $1`, [id], client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listFilesWithChunksInFolders(folderIds: string[]) {
  if (folderIds.length === 0) {
    return [];
  }

  const { rows: files } = await query<FileRecord>(
    `
      SELECT ${fileSelect}
      FROM "File"
      WHERE "folderId" = ANY($1::text[])
    `,
    [folderIds]
  );

  if (files.length === 0) {
    return [];
  }

  const fileIds = files.map((file) => file.id);
  const { rows: chunks } = await query<FileChunkRecord>(
    `
      SELECT ${chunkSelect}
      FROM "FileChunk"
      WHERE "fileId" = ANY($1::text[])
      ORDER BY "chunkIndex" ASC
    `,
    [fileIds]
  );
  const chunksByFile = new Map<string, FileChunkRecord[]>();

  for (const chunk of chunks) {
    const existing = chunksByFile.get(chunk.fileId) ?? [];
    existing.push(chunk);
    chunksByFile.set(chunk.fileId, existing);
  }

  return files.map((file) => ({
    ...file,
    chunks: chunksByFile.get(file.id) ?? [],
  }));
}

export async function getStorageStats() {
  const { rows } = await query<{
    totalFiles: string | number;
    totalFolders: string | number;
    starredFiles: string | number;
    trashedFiles: string | number;
    totalSize: string | number | null;
  }>(
    `
      SELECT
        (SELECT COUNT(*) FROM "File" WHERE "trashedAt" IS NULL)::int AS "totalFiles",
        (SELECT COUNT(*) FROM "Folder")::int AS "totalFolders",
        (
          SELECT COUNT(*) FROM "File"
          WHERE starred = TRUE AND "trashedAt" IS NULL
        )::int AS "starredFiles",
        (SELECT COUNT(*) FROM "File" WHERE "trashedAt" IS NOT NULL)::int AS "trashedFiles",
        COALESCE((SELECT SUM(size) FROM "File"), 0)::bigint AS "totalSize"
    `
  );
  const stats = rows[0];

  return {
    totalFiles: Number(stats.totalFiles),
    totalFolders: Number(stats.totalFolders),
    starredFiles: Number(stats.starredFiles),
    trashedFiles: Number(stats.trashedFiles),
    totalSize: Number(stats.totalSize ?? 0),
  };
}
