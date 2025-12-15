import { v7 as uuidv7 } from "uuid";
import * as membershipRepository from "../repositories/membership.repository";
import * as roleRepository from "../repositories/role.repository";

export async function listClubMembers(clubId: string) {
  if (typeof clubId !== "string" || clubId.length === 0) throw new Error("clubId is required");
  return membershipRepository.listClubMembers(clubId);
}

export async function addMemberToClub(input: { clubId: string; userId: string }) {
  if (typeof input.clubId !== "string" || input.clubId.length === 0) throw new Error("clubId is required");
  if (typeof input.userId !== "string" || input.userId.length === 0) throw new Error("userId is required");

  const existing = await membershipRepository.getMembershipByUserAndClub({
    clubId: input.clubId,
    userId: input.userId,
  });
  if (existing) return existing;

  const membership = await membershipRepository.createMembership({
    id: uuidv7(),
    clubId: input.clubId,
    userId: input.userId,
  });

  const memberRole = await roleRepository.getRoleByName({ clubId: input.clubId, name: "member" });
  if (memberRole) {
    await membershipRepository.setMembershipRoles({ membershipId: membership.id, roleIds: [memberRole.id] });
  }

  return membership;
}

export async function setMemberRoles(input: { clubId: string; userId: string; roles: string[] }) {
  const membership = await membershipRepository.getMembershipByUserAndClub({
    clubId: input.clubId,
    userId: input.userId,
  });
  if (!membership) throw new Error("membership not found");

  const roleIds: string[] = [];
  for (const roleName of input.roles) {
    const trimmed = roleName.trim();
    if (!trimmed) continue;
    const role = await roleRepository.upsertRole({ id: uuidv7(), clubId: input.clubId, name: trimmed });
    roleIds.push(role.id);
  }

  await membershipRepository.setMembershipRoles({ membershipId: membership.id, roleIds });
  return membership;
}

export async function getMemberEffectivePermissions(input: { clubId: string; userId: string }) {
  const membership = await membershipRepository.getMembershipByUserAndClub({
    clubId: input.clubId,
    userId: input.userId,
  });
  if (!membership) throw new Error("membership not found");
  return membershipRepository.listMembershipEffectivePermissions({ membershipId: membership.id });
}

