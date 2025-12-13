import { env } from "./env";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

let prisma: any | undefined;

export function getPrisma() {
  if (prisma) return prisma;

  try {
    const { PrismaPg } = require("@prisma/adapter-pg") as any;
    const { PrismaClient } = require("@prisma/client") as any;

    const adapter = new PrismaPg({ connectionString: env.databaseUrl });
    prisma = new PrismaClient({ adapter });
    return prisma;
  } catch (error) {
    const message = String((error as Error)?.message ?? error);

    if (message.includes("Cannot find module '@prisma/adapter-pg'")) {
      throw new Error("Missing dependency: install `@prisma/adapter-pg` (and `pg`).");
    }

    if (message.includes("Cannot find module '.prisma/client")) {
      throw new Error("Prisma Client not generated: run `APP_ENV=local pnpm -C backend db:generate`.");
    }

    throw new Error(`Prisma is not ready: ${message}`);
  }
}

export async function disconnectDb(): Promise<void> {
  if (!prisma) return;
  await prisma.$disconnect();
}
