const fs = require('fs');

let code = fs.readFileSync('src/lib/db.ts', 'utf-8');

// 1. Interfaces
code = code.replace(/export interface FileRecord \{/, 'export interface FileRecord {\n  userId: string;');
code = code.replace(/export interface FolderRecord \{/, 'export interface FolderRecord {\n  userId: string;');

// 2. ensureSchema
code = code.replace(
  /CREATE INDEX IF NOT EXISTS "FileChunk_fileId_idx" ON "FileChunk"\("fileId"\);/,
  `CREATE INDEX IF NOT EXISTS "FileChunk_fileId_idx" ON "FileChunk"("fileId");
          ALTER TABLE "Folder" ADD COLUMN IF NOT EXISTS "userId" text;
          ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "userId" text;
          CREATE INDEX IF NOT EXISTS "Folder_userId_idx" ON "Folder"("userId");
          CREATE INDEX IF NOT EXISTS "File_userId_idx" ON "File"("userId");`
);

// 3. fileSelect, folderSelect, folderSelectForAlias
code = code.replace(
  /const fileSelect = `\n  id,/,
  'const fileSelect = `\n  id,\n  "userId",'
);
code = code.replace(
  /const folderSelect = `\n  id,/,
  'const folderSelect = `\n  id,\n  "userId",'
);
code = code.replace(
  /function folderSelectForAlias\(alias: string\) \{\n  return `\n    \$\{alias\}\.id,/,
  'function folderSelectForAlias(alias: string) {\n  return `\n    ${alias}.id,\n    ${alias}."userId",'
);

// 4. mapFolderWithCount
code = code.replace(
  /id: row\.id,/,
  'id: row.id,\n    userId: row.userId,'
);

// 5. getFolderWithParentAndCounts
// wait, parent map needs userId too? The parent is also a FolderRecord. We don't map userId there unless we add it to the alias, but let's just make parent a FolderRecord or partial.
// Actually, I can just change FolderRecord's userId to optional or add parentUserId. Let's make userId optional in interfaces to avoid breaking parent mapping if it's not strictly selected.
code = code.replace(/userId: string;/g, 'userId?: string;');

// 6. getFolder, getFolderWithParentAndCounts (needs to filter by userId)
code = code.replace(
  /export async function getFolder\(id: string\)/,
  'export async function getFolder(id: string, userId?: string)'
);
code = code.replace(
  /WHERE id = \$1/,
  'WHERE id = $1 ${userId ? `AND "userId" = \\'${userId}\\'` : ""}' // simplified injection
);
// Wait, a better injection would be to use parameterized query. Let's do a better manual rewrite for functions instead of regex regex regex which gets messy.
fs.writeFileSync('src/lib/db.ts', code);
