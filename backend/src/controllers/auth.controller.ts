import type { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function postRegister(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body ?? {};
    const result = await authService.register({
      email,
      password,
      name: typeof name === "string" ? name : null,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function postLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body ?? {};
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await authService.me(req.userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

