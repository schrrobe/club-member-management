import type { Request, Response } from "express";
import * as userService from "../services/user.service";

export async function getUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function postUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, name } = req.body ?? {};
    const user = await userService.createUser({
      email,
      name: typeof name === "string" ? name : null,
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getMyClubs(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const clubs = await userService.listUserClubs(req.userId);
    res.json(clubs);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getUserClubs(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const clubs = await userService.listUserClubs(userId);
    res.json(clubs);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
