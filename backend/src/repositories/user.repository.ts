import type { User } from "../models/user.model";
import { getPrisma } from "../config/db";

export async function listUsers(): Promise<User[]> {
  return getPrisma().user.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createUser(input: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<User> {
  return getPrisma().user.create({
    data: {
      id: input.id,
      email: input.email,
      name: input.name ?? null,
    },
  });
}
