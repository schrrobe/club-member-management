import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? "local";
const backendRoot = path.resolve(__dirname, "..", "..");
const envCandidates = [
  path.resolve(backendRoot, `.env.${appEnv}`),
  path.resolve(backendRoot, ".env"),
];
const envFilePath = envCandidates.find((candidate) => fs.existsSync(candidate));

dotenv.config(envFilePath ? { path: envFilePath } : undefined);

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTrustProxy(value: string | undefined): number | boolean | string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return undefined;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber) && asNumber >= 0) return asNumber;
  return value;
}

const defaultCorsOrigins =
  appEnv === "local"
    ? ["http://localhost:5173", "http://127.0.0.1:5173"]
    : [];

const corsOrigins = parseCsv(process.env.CORS_ORIGINS);
const rateLimitAllowlist = parseCsv(process.env.RATE_LIMIT_ALLOWLIST);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
const rateLimitLimit = Number(process.env.RATE_LIMIT_LIMIT ?? 200);
const jwtExpiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 60 * 60 * 24);

export const env = {
  appEnv,
  port: Number(process.env.PORT ?? 3000),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  databaseUrl: process.env.DATABASE_URL,
  adminApiKey: process.env.ADMIN_API_KEY,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresInSeconds: Number.isFinite(jwtExpiresInSeconds) ? jwtExpiresInSeconds : 60 * 60 * 24,
  },
  cors: {
    origins: corsOrigins.length > 0 ? corsOrigins : defaultCorsOrigins,
  },
  rateLimit: {
    windowMs: Number.isFinite(rateLimitWindowMs) ? rateLimitWindowMs : 15 * 60 * 1000,
    limit: Number.isFinite(rateLimitLimit) ? rateLimitLimit : 200,
    allowlist: rateLimitAllowlist,
  },
};
