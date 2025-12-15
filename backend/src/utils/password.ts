import crypto from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

export function hashPassword(plain: string): string {
  if (typeof plain !== "string" || plain.length < 8) {
    throw new Error("password must be at least 8 characters");
  }

  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(plain, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parsed = parseScryptHash(stored);
  if (!parsed) return false;

  const derived = crypto.scryptSync(plain, parsed.salt, KEYLEN, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p,
  });

  const expected = Buffer.from(parsed.hashHex, "hex");
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(expected, derived);
}

function parseScryptHash(value: string): {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  hashHex: string;
} | null {
  const parts = value.split("$");
  if (parts.length !== 7) return null;
  const [alg, empty, N, r, p, saltHex, hashHex] = parts;
  if (alg !== "scrypt" || empty !== "") return null;

  const Nn = Number(N);
  const rn = Number(r);
  const pn = Number(p);
  if (!Number.isInteger(Nn) || !Number.isInteger(rn) || !Number.isInteger(pn)) return null;
  if (Nn <= 0 || rn <= 0 || pn <= 0) return null;

  if (!/^[0-9a-f]+$/i.test(saltHex) || saltHex.length % 2 !== 0) return null;
  if (!/^[0-9a-f]+$/i.test(hashHex) || hashHex.length % 2 !== 0) return null;

  return { N: Nn, r: rn, p: pn, salt: Buffer.from(saltHex, "hex"), hashHex };
}

