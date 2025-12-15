import net from "node:net";

type IpVersion = 4 | 6;

type AllowlistRule =
  | { kind: "ip"; version: IpVersion; value: bigint }
  | { kind: "cidr"; version: IpVersion; base: bigint; prefix: number };

export function createIpAllowlistMatcher(entries: string[]) {
  const rules = parseAllowlist(entries);
  return (ip: string | undefined | null) => isIpAllowed(ip, rules);
}

function parseAllowlist(entries: string[]): AllowlistRule[] {
  const rules: AllowlistRule[] = [];

  for (const raw of entries) {
    const entry = raw.trim();
    if (!entry) continue;

    if (entry.includes("/")) {
      const cidr = parseCidr(entry);
      if (cidr) rules.push(cidr);
      continue;
    }

    const parsedIp = parseIp(entry);
    if (parsedIp) rules.push({ kind: "ip", ...parsedIp });
  }

  return rules;
}

function isIpAllowed(ip: string | undefined | null, rules: AllowlistRule[]): boolean {
  if (!ip) return false;

  const normalized = normalizeExpressIp(ip);
  if (!normalized) return false;

  const parsed = parseIp(normalized);
  if (!parsed) return false;

  for (const rule of rules) {
    if (rule.version !== parsed.version) continue;

    if (rule.kind === "ip") {
      if (rule.value === parsed.value) return true;
      continue;
    }

    if (rule.kind === "cidr") {
      if (ipInCidr(parsed.value, rule.base, rule.prefix, rule.version)) return true;
    }
  }

  return false;
}

function normalizeExpressIp(ip: string): string | null {
  const trimmed = ip.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("::ffff:")) return trimmed.slice("::ffff:".length);
  return trimmed;
}

function parseCidr(value: string): AllowlistRule | null {
  const [ipPart, prefixPart] = value.split("/", 2);
  if (!ipPart || prefixPart == null) return null;

  const parsedIp = parseIp(ipPart.trim());
  if (!parsedIp) return null;

  const prefix = Number(prefixPart.trim());
  if (!Number.isInteger(prefix)) return null;

  const maxPrefix = parsedIp.version === 4 ? 32 : 128;
  if (prefix < 0 || prefix > maxPrefix) return null;

  const base = applyMask(parsedIp.value, prefix, parsedIp.version);
  return { kind: "cidr", version: parsedIp.version, base, prefix };
}

function parseIp(value: string): { version: IpVersion; value: bigint } | null {
  const normalized = value.trim();
  const version = net.isIP(normalized);
  if (version === 4) return { version: 4, value: ipv4ToBigInt(normalized) };
  if (version === 6) return { version: 6, value: ipv6ToBigInt(normalized) };
  return null;
}

function ipv4ToBigInt(ip: string): bigint {
  const parts = ip.split(".");
  if (parts.length !== 4) return 0n;

  let value = 0n;
  for (const part of parts) {
    const byte = Number(part);
    value = (value << 8n) + BigInt(byte & 0xff);
  }
  return value;
}

function ipv6ToBigInt(ip: string): bigint {
  const lower = ip.toLowerCase();
  const [leftRaw, rightRaw] = lower.split("::", 2);
  const left = leftRaw ? expandIpv6Parts(leftRaw.split(":").filter(Boolean)) : [];
  const right = rightRaw ? expandIpv6Parts(rightRaw.split(":").filter(Boolean)) : [];

  const totalGroups = left.length + right.length;
  const missingGroups = Math.max(0, 8 - totalGroups);
  const groups = [...left, ...Array.from({ length: missingGroups }, () => "0"), ...right];

  let value = 0n;
  for (const group of groups.slice(0, 8)) {
    const chunk = BigInt(parseInt(group || "0", 16) & 0xffff);
    value = (value << 16n) + chunk;
  }
  return value;
}

function expandIpv6Parts(parts: string[]): string[] {
  const expanded: string[] = [];

  for (const part of parts) {
    if (!part.includes(".")) {
      expanded.push(part);
      continue;
    }

    const ipv4 = part.trim();
    if (net.isIP(ipv4) !== 4) continue;

    const value = ipv4ToBigInt(ipv4);
    const high = Number((value >> 16n) & 0xffffn).toString(16);
    const low = Number(value & 0xffffn).toString(16);
    expanded.push(high, low);
  }

  return expanded;
}

function ipInCidr(ip: bigint, base: bigint, prefix: number, version: IpVersion): boolean {
  return applyMask(ip, prefix, version) === base;
}

function applyMask(value: bigint, prefix: number, version: IpVersion): bigint {
  const bits = version === 4 ? 32 : 128;
  if (prefix === 0) return 0n;
  if (prefix === bits) return value;

  const shift = BigInt(bits - prefix);
  return (value >> shift) << shift;
}
