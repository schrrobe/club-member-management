import http from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { disconnectDb } from "./config/db";
import { logger } from "./utils/logger";

const app = createApp();
const server = http.createServer(app);

server.listen(env.port, () => {
  logger.info(`Listening on http://localhost:${env.port}`);
});

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down...`);
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

