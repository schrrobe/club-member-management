import { v7 as uuidv7 } from "uuid";
import * as clubRepository from "../repositories/club.repository";
import * as membershipRepository from "../repositories/membership.repository";
import * as permissionRepository from "../repositories/permission.repository";
import * as roleRepository from "../repositories/role.repository";

const DEFAULT_PERMISSIONS = [
  { key: "club:read", description: "Read club data" },
  { key: "club:manage", description: "Manage club settings" },
  { key: "member:read", description: "Read members" },
  { key: "member:write", description: "Manage members" },
  { key: "role:manage", description: "Manage roles and permissions" },
] as const;

export async function listClubs() {
  return clubRepository.listClubs();
}

export async function createClub(input: { name: string; createdByUserId: string }) {
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    throw new Error("name is required");
  }
  if (typeof input.createdByUserId !== "string" || input.createdByUserId.length === 0) {
    throw new Error("createdByUserId is required");
  }

  const clubId = uuidv7();
  const club = await clubRepository.createClub({
    id: clubId,
    name: input.name.trim(),
    createdById: input.createdByUserId,
  });

  const [adminRole, memberRole] = await Promise.all([
    roleRepository.upsertRole({ id: uuidv7(), clubId, name: "admin" }),
    roleRepository.upsertRole({ id: uuidv7(), clubId, name: "member" }),
  ]);

  const permissions = await Promise.all(
    DEFAULT_PERMISSIONS.map((p) =>
      permissionRepository.upsertPermission({ id: uuidv7(), key: p.key, description: p.description }),
    ),
  );

  const byKey = new Map(permissions.map((p) => [p.key, p.id] as const));

  await Promise.all([
    roleRepository.setRolePermissions({
      roleId: adminRole.id,
      permissionIds: permissions.map((p) => p.id),
    }),
    roleRepository.setRolePermissions({
      roleId: memberRole.id,
      permissionIds: [byKey.get("club:read")!, byKey.get("member:read")!],
    }),
  ]);

  const membership = await membershipRepository.createMembership({
    id: uuidv7(),
    userId: input.createdByUserId,
    clubId,
  });

  await membershipRepository.setMembershipRoles({ membershipId: membership.id, roleIds: [adminRole.id] });

  return { club, membership };
}

