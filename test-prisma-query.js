const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  const folders = await prisma.folder.findMany({ take: 1 });
  console.log("Success! Folders:", folders);
}
main().catch(console.error).finally(() => prisma.$disconnect());
