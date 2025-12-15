import crypto from "node:crypto";
import { base64UrlDecodeToBuffer, base64UrlEncode } from "./base64url";

type TokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

type TokenHeader = {
  alg: "HS256";
  typ: "JWT";
};

export function signAccessToken(input: {
  userId: string;
  email: string;
  expiresInSeconds: number;
  secret: string;
  now?: Date;
}): string {
  const now = input.now ?? new Date();
  const iat = Math.floor(now.getTime() / 1000);
  const exp = iat + input.expiresInSeconds;

  const header: TokenHeader = { alg: "HS256", typ: "JWT" };
  const payload: TokenPayload = { sub: input.userId, email: input.email, iat, exp };

  const headerB64 = base64UrlEncode(Buffer.from(JSON.stringify(header), "utf8"));
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const signingInput = `${headerB64}.${payloadB64}`;
  const sigB64 = hmacSha256Base64Url(signingInput, input.secret);
  return `${signingInput}.${sigB64}`;
}

export function verifyAccessToken(input: {
  token: string;
  secret: string;
  now?: Date;
}): { userId: string; email: string } {
  const parts = input.token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const [headerB64, payloadB64, sigB64] = parts;

  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSigB64 = hmacSha256Base64Url(signingInput, input.secret);
  if (!timingSafeEqualString(sigB64, expectedSigB64)) {
    throw new Error("Invalid token signature");
  }

  const headerJson = base64UrlDecodeToBuffer(headerB64).toString("utf8");
  const header = safeJsonParse(headerJson) as Partial<TokenHeader> | null;
  if (!header || header.alg !== "HS256" || header.typ !== "JWT") {
    throw new Error("Invalid token header");
  }

  const payloadJson = base64UrlDecodeToBuffer(payloadB64).toString("utf8");
  const payload = safeJsonParse(payloadJson) as Partial<TokenPayload> | null;
  if (!payload || typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("Invalid token payload");
  }
  if (typeof payload.exp !== "number" || typeof payload.iat !== "number") {
    throw new Error("Invalid token timestamps");
  }

  const now = input.now ?? new Date();
  const nowSeconds = Math.floor(now.getTime() / 1000);
  if (nowSeconds >= payload.exp) throw new Error("Token expired");

  return { userId: payload.sub, email: payload.email };
}

function hmacSha256Base64Url(data: string, secret: string): string {
  const digest = crypto.createHmac("sha256", secret).update(data).digest();
  return base64UrlEncode(digest);
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

