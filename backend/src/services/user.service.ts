import type { User } from "../models/user.model";
import * as userRepository from "../repositories/user.repository";

export async function listUsers(): Promise<User[]> {
  return userRepository.listUsers();
}

export async function createUser(input: { email: string; name?: string | null }): Promise<User> {
  if (typeof input.email !== "string" || input.email.length === 0) {
    throw new Error("email is required");
  }
  return userRepository.createUser(input);
}

