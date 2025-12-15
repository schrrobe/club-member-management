import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export function requireAdminApiKey(req: Request, res: Response, next: NextFunction): void {
  const expected = env.adminApiKey;
  if (!expected) {
    res.status(500).json({ error: "ADMIN_API_KEY is not configured" });
    return;
  }

  const provided = req.header("x-admin-key");
  if (!provided) {
    res.status(401).json({ error: "Missing x-admin-key" });
    return;
  }

  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}

