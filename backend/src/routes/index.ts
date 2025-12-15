import { Router } from "express";
import { userRouter } from "./user.routes";
import { clubRouter } from "./club.routes";
import { authRouter } from "./auth.routes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ ok: true });
});

routes.use("/users", userRouter);
routes.use("/clubs", clubRouter);
routes.use("/auth", authRouter);
