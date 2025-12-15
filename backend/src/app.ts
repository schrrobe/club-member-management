import express from "express";
import helmet from "helmet";
import { routes } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { env } from "./config/env";
import { createCorsMiddleware } from "./middlewares/cors.middleware";
import { createRateLimitMiddleware } from "./middlewares/rate-limit.middleware";

export function createApp() {
  const app = express();

  if (env.trustProxy !== undefined) {
    app.set("trust proxy", env.trustProxy);
  }

  app.use(helmet());
  app.use(createCorsMiddleware());
  app.use(createRateLimitMiddleware());
  app.use(express.json());
  app.use(routes);
  app.use(errorMiddleware);
  return app;
}
