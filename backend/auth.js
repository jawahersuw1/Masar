// auth.js - passwords, tokens, staff codes and a small login limiter. Uses only Node's built-in crypto.
import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

// ---- passwords: salted scrypt hash, stored as "scrypt$salt$hash" ----
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [kind, saltHex, keyHex] = (stored ?? "").split("$");
  if (kind !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const key = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(key, expected);
}

// A fake hash, so a login for an unknown email takes as long as a login for a known one.
let dummyHash = null;
export async function verifyAgainstDummy(password) {
  dummyHash ??= await hashPassword("not-a-real-password");
  await verifyPassword(password, dummyHash);
}

// ---- tokens: random, and only their hash is saved in the database ----
export const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");
export const newToken = () => crypto.randomBytes(32).toString("base64url");

// ---- bank staff code: compare the hash of what was typed with the stored hash ----
export function codeMatches(entered, storedHashHex) {
  if (!storedHashHex || typeof entered !== "string") return false;
  const a = Buffer.from(sha256(entered.trim()), "hex");
  const b = Buffer.from(storedHashHex, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---- a tiny limiter: at most `max` tries per `windowMs` for the same key (in memory, resets when the server restarts) ----
export function makeLimiter({ max, windowMs }) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    return recent.length <= max;               // false = too many tries
  };
}
