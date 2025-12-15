import { Router } from "express";
import * as clubController from "../controllers/club.controller";
import * as membershipController from "../controllers/membership.controller";
import { requireAuth, requireClubPermission } from "../middlewares/auth.middleware";

export const clubRouter = Router();

clubRouter.get("/", clubController.getClubs);
clubRouter.post("/", requireAuth, clubController.postClub);

clubRouter.get("/:clubId/members", requireAuth, requireClubPermission("member:read"), membershipController.getClubMembers);
clubRouter.post(
  "/:clubId/members",
  requireAuth,
  requireClubPermission("member:write"),
  membershipController.postClubMember,
);
clubRouter.put(
  "/:clubId/members/:userId/roles",
  requireAuth,
  requireClubPermission("role:manage"),
  membershipController.putClubMemberRoles,
);
clubRouter.get(
  "/:clubId/members/:userId/permissions",
  requireAuth,
  requireClubPermission("member:read"),
  membershipController.getClubMemberPermissions,
);
