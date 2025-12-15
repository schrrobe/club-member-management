import { getPrisma } from "../config/db";
import type { Role } from "../models/role.model";

export async function upsertRole(input: {
  id: string;
  clubId: string;
  name: string;
}): Promise<Role> {
  return getPrisma().role.upsert({
    where: { clubId_name: { clubId: input.clubId, name: input.name } },
    create: { id: input.id, clubId: input.clubId, name: input.name },
    update: {},
  });
}

export async function setRolePermissions(input: { roleId: string; permissionIds: string[] }): Promise<void> {
  const prisma = getPrisma();
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: input.roleId } }),
    prisma.rolePermission.createMany({
      data: input.permissionIds.map((permissionId) => ({ roleId: input.roleId, permissionId })),
      skipDuplicates: true,
    }),
  ]);
}

export async function getRoleByName(input: { clubId: string; name: string }): Promise<Role | null> {
  return getPrisma().role.findUnique({ where: { clubId_name: { clubId: input.clubId, name: input.name } } });
}

