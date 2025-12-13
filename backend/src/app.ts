import express from "express";
import { routes } from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import "./config/env";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(routes);
  app.use(errorMiddleware);
  return app;
}

