import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/register", authController.postRegister);
authRouter.post("/login", authController.postLogin);
authRouter.get("/me", requireAuth, authController.getMe);

