import { env } from "./env";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

let prisma: any | undefined;

export function getPrisma() {
  if (prisma) return prisma;

  try {
    const { PrismaClient } = require("@prisma/client") as any;
    prisma = new PrismaClient();
    return prisma;
  } catch (error) {
    throw new Error(
      "Prisma Client is not generated. Run `pnpm -C backend db:generate` (may require network access for Prisma engines).",
    );
  }
}

export async function disconnectDb(): Promise<void> {
  if (!prisma) return;
  await prisma.$disconnect();
}
