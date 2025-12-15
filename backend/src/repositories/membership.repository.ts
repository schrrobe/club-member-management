import { getPrisma } from "../config/db";
import type { Membership } from "../models/membership.model";

export async function getMembershipByUserAndClub(input: {
  userId: string;
  clubId: string;
}): Promise<Membership | null> {
  return getPrisma().membership.findUnique({
    where: { userId_clubId: { userId: input.userId, clubId: input.clubId } },
  });
}

export async function createMembership(input: {
  id: string;
  userId: string;
  clubId: string;
}): Promise<Membership> {
  return getPrisma().membership.create({
    data: {
      id: input.id,
      userId: input.userId,
      clubId: input.clubId,
    },
  });
}

export async function listClubMembers(clubId: string) {
  return getPrisma().membership.findMany({
    where: { clubId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, email: true, name: true, createdAt: true } },
      roles: { include: { role: true } },
    },
  });
}

export async function listUserClubs(userId: string) {
  return getPrisma().membership.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      club: true,
      roles: { include: { role: true } },
    },
  });
}

export async function setMembershipRoles(input: {
  membershipId: string;
  roleIds: string[];
}): Promise<void> {
  const prisma = getPrisma();
  await prisma.$transaction([
    prisma.membershipRole.deleteMany({ where: { membershipId: input.membershipId } }),
    prisma.membershipRole.createMany({
      data: input.roleIds.map((roleId) => ({ membershipId: input.membershipId, roleId })),
      skipDuplicates: true,
    }),
  ]);
}

export async function listMembershipEffectivePermissions(input: { membershipId: string }): Promise<string[]> {
  const membership = await getPrisma().membership.findUnique({
    where: { id: input.membershipId },
    include: {
      permissions: { include: { permission: true } },
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
    },
  });

  if (!membership) return [];

  const keys = new Set<string>();
  for (const mp of membership.permissions) keys.add(mp.permission.key);
  for (const mr of membership.roles) {
    for (const rp of mr.role.permissions) keys.add(rp.permission.key);
  }
  return Array.from(keys).sort();
}
