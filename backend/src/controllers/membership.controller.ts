import type { Request, Response } from "express";
import * as membershipService from "../services/membership.service";

export async function getClubMembers(req: Request, res: Response): Promise<void> {
  try {
    const { clubId } = req.params;
    const members = await membershipService.listClubMembers(clubId);
    res.json(members);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function postClubMember(req: Request, res: Response): Promise<void> {
  try {
    const { clubId } = req.params;
    const { userId } = req.body ?? {};
    const membership = await membershipService.addMemberToClub({ clubId, userId });
    res.status(201).json(membership);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function putClubMemberRoles(req: Request, res: Response): Promise<void> {
  try {
    const { clubId, userId } = req.params;
    const { roles } = req.body ?? {};
    if (!Array.isArray(roles)) throw new Error("roles must be an array of strings");
    const membership = await membershipService.setMemberRoles({
      clubId,
      userId,
      roles: roles.filter((r): r is string => typeof r === "string"),
    });
    res.json(membership);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getClubMemberPermissions(req: Request, res: Response): Promise<void> {
  try {
    const { clubId, userId } = req.params;
    const permissions = await membershipService.getMemberEffectivePermissions({ clubId, userId });
    res.json({ permissions });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

