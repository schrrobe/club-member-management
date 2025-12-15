import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdminApiKey } from "../middlewares/admin.middleware";

export const userRouter = Router();

userRouter.get("/", userController.getUsers);
userRouter.post("/", userController.postUser);

userRouter.get("/me/clubs", requireAuth, userController.getMyClubs);
userRouter.get("/:userId/clubs", requireAuth, requireAdminApiKey, userController.getUserClubs);
