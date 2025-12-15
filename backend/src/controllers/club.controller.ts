import type { Request, Response } from "express";
import * as clubService from "../services/club.service";

export async function getClubs(_req: Request, res: Response): Promise<void> {
  try {
    const clubs = await clubService.listClubs();
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function postClub(req: Request, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name } = req.body ?? {};
    const result = await clubService.createClub({ name, createdByUserId: req.userId });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
