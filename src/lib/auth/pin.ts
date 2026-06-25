import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Per-parent PIN hashing. The PIN is a soft gate to keep a child out of the
// parent area — not a high-value secret — but we still salt + scrypt + compare
// in constant time rather than storing it in the clear. SERVER-ONLY (node:crypto):
// only ever imported by the "use server" actions file — never a client component.

const KEY_LEN = 32;

/** Hash a PIN with a fresh random salt. Returns both for storage. */
export function hashPin(pin: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, KEY_LEN).toString("hex");
  return { hash, salt };
}

/** Constant-time check of a PIN against a stored hash+salt. */
export function verifyPin(pin: string, hash: string, salt: string): boolean {
  const candidate = scryptSync(pin, salt, KEY_LEN);
  const stored = Buffer.from(hash, "hex");
  if (stored.length !== candidate.length) return false;
  return timingSafeEqual(stored, candidate);
}
