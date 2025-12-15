import { getPrisma } from "../config/db";
import type { Club } from "../models/club.model";

export async function listClubs(): Promise<Club[]> {
  return getPrisma().club.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getClubById(id: string): Promise<Club | null> {
  return getPrisma().club.findUnique({ where: { id } });
}

export async function createClub(input: { id: string; name: string; createdById: string }): Promise<Club> {
  return getPrisma().club.create({
    data: {
      id: input.id,
      name: input.name,
      createdById: input.createdById,
    },
  });
}

