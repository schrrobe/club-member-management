import type { User } from "../models/user.model";
import { getPrisma } from "../config/db";

export async function listUsers(): Promise<User[]> {
  return getPrisma().user.findMany({ orderBy: { id: "asc" } });
}

export async function createUser(input: { email: string; name?: string | null }): Promise<User> {
  return getPrisma().user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
    },
  });
}
