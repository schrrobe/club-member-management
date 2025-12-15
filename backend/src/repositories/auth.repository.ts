import { getPrisma } from "../config/db";

export async function getUserForAuthByEmail(email: string): Promise<{
  id: string;
  email: string;
  passwordHash: string | null;
} | null> {
  return getPrisma().user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });
}

export async function createUserWithPasswordHash(input: {
  id: string;
  email: string;
  name?: string | null;
  passwordHash: string;
}): Promise<{ id: string; email: string; name: string | null; createdAt: Date }> {
  return getPrisma().user.create({
    data: {
      id: input.id,
      email: input.email,
      name: input.name ?? null,
      passwordHash: input.passwordHash,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

export async function getUserPublicById(id: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
} | null> {
  return getPrisma().user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

