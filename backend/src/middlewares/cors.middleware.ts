import cors from "cors";
import { env } from "../config/env";

export function createCorsMiddleware() {
  const allowAll = env.cors.origins.includes("*");
  const allowed = new Set(env.cors.origins);

  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowAll || allowed.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  });
}

