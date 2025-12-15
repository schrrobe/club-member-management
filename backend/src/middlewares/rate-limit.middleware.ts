import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { createIpAllowlistMatcher } from "../utils/ip-allowlist";

export function createRateLimitMiddleware() {
  const isAllowlistedIp = createIpAllowlistMatcher(env.rateLimit.allowlist);

  return rateLimit({
    windowMs: env.rateLimit.windowMs,
    limit: env.rateLimit.limit,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health" || isAllowlistedIp(req.ip),
    handler: (_req, res) => res.status(429).json({ error: "Too many requests" }),
  });
}

