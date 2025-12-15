import type { User } from "../models/user.model";
import * as userRepository from "../repositories/user.repository";
import * as membershipRepository from "../repositories/membership.repository";
import { v7 as uuidv7 } from "uuid";

export async function listUsers(): Promise<User[]> {
  return userRepository.listUsers();
}

export async function createUser(input: { email: string; name?: string | null }): Promise<User> {
  if (typeof input.email !== "string" || input.email.length === 0) {
    throw new Error("email is required");
  }
  return userRepository.createUser({ id: uuidv7(), ...input });
}

export async function listUserClubs(userId: string) {
  if (typeof userId !== "string" || userId.length === 0) throw new Error("userId is required");
  const memberships = (await membershipRepository.listUserClubs(userId)) as Array<{
    id: string;
    createdAt: Date;
    club: { id: string; name: string; createdAt: Date; createdById: string };
    roles: Array<{ role: { id: string; clubId: string; name: string; createdAt: Date } }>;
  }>;
  return memberships.map((m) => ({
    membershipId: m.id,
    club: m.club,
    roles: m.roles.map((r) => r.role.name).sort(),
    joinedAt: m.createdAt,
  }));
}
