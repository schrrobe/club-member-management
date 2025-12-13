import http from "node:http";
import path from "node:path";
import express from "express";
import dotenv from "dotenv";

const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? "local";
const envPath = path.resolve(process.cwd(), `.env.${appEnv}`);
dotenv.config({ path: envPath });

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("OK");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT ?? 3000);
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
