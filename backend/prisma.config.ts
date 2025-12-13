import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? "local";
const backendRoot = __dirname;

const envCandidates = [
  path.resolve(backendRoot, `.env.${appEnv}`),
  path.resolve(backendRoot, ".env"),
];
const envFilePath = envCandidates.find((candidate) => fs.existsSync(candidate));

dotenv.config(envFilePath ? { path: envFilePath } : undefined);

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});

