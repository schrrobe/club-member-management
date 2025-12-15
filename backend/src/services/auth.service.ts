import { v7 as uuidv7 } from "uuid";
import { env } from "../config/env";
import * as authRepository from "../repositories/auth.repository";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken } from "../utils/token";

function requireJwtSecret(): string {
  const secret = env.jwt.secret;
  if (!secret || secret.trim().length < 16) {
    throw new Error("JWT_SECRET is missing or too short (min 16 chars)");
  }
  return secret;
}

export async function register(input: { email: string; password: string; name?: string | null }) {
  if (typeof input.email !== "string" || input.email.length === 0) throw new Error("email is required");
  if (typeof input.password !== "string") throw new Error("password is required");

  const email = input.email.trim().toLowerCase();
  const passwordHash = hashPassword(input.password);

  const user = await authRepository.createUserWithPasswordHash({
    id: uuidv7(),
    email,
    name: input.name ?? null,
    passwordHash,
  });

  const token = signAccessToken({
    userId: user.id,
    email: user.email,
    expiresInSeconds: env.jwt.expiresInSeconds,
    secret: requireJwtSecret(),
  });

  return { user, token };
}

export async function login(input: { email: string; password: string }) {
  if (typeof input.email !== "string" || input.email.length === 0) throw new Error("email is required");
  if (typeof input.password !== "string") throw new Error("password is required");

  const email = input.email.trim().toLowerCase();
  const user = await authRepository.getUserForAuthByEmail(email);
  if (!user || !user.passwordHash) throw new Error("Invalid credentials");

  const ok = verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const token = signAccessToken({
    userId: user.id,
    email: user.email,
    expiresInSeconds: env.jwt.expiresInSeconds,
    secret: requireJwtSecret(),
  });

  return { token };
}

export async function me(userId: string) {
  const user = await authRepository.getUserPublicById(userId);
  if (!user) throw new Error("User not found");
  return user;
}

