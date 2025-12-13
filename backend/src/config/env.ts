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

export const env = {
  appEnv,
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
};
