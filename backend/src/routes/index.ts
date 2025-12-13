import { Router } from "express";
import { userRouter } from "./user.routes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ ok: true });
});

routes.use("/users", userRouter);

