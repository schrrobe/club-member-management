import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/token";
import * as membershipRepository from "../repositories/membership.repository";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith("bearer ")) {
      res.status(401).json({ error: "Missing Authorization Bearer token" });
      return;
    }

    if (!env.jwt.secret) {
      res.status(500).json({ error: "JWT_SECRET is not configured" });
      return;
    }

    const token = header.slice("bearer ".length).trim();
    const payload = verifyAccessToken({ token, secret: env.jwt.secret });
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}

export function requireClubPermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const clubId = req.params.clubId;
      if (typeof clubId !== "string" || clubId.length === 0) {
        res.status(400).json({ error: "clubId is required" });
        return;
      }

      const membership = await membershipRepository.getMembershipByUserAndClub({ userId, clubId });
      if (!membership) {
        res.status(403).json({ error: "Not a member of this club" });
        return;
      }

      const permissions = await membershipRepository.listMembershipEffectivePermissions({
        membershipId: membership.id,
      });

      if (!permissions.includes(permissionKey)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
