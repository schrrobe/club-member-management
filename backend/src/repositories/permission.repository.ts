import { getPrisma } from "../config/db";
import type { Permission } from "../models/permission.model";

export async function upsertPermission(input: {
  id: string;
  key: string;
  description?: string | null;
}): Promise<Permission> {
  return getPrisma().permission.upsert({
    where: { key: input.key },
    create: { id: input.id, key: input.key, description: input.description ?? null },
    update: { description: input.description ?? null },
  });
}

