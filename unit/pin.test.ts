import { describe, expect, it } from "vitest";

import { isValidPinFormat, PIN_LENGTH } from "@/lib/auth/constants";
import { hashPin, verifyPin } from "@/lib/auth/pin";

describe("isValidPinFormat", () => {
  it("accepts exactly 4 digits", () => {
    expect(isValidPinFormat("1234")).toBe(true);
    expect(isValidPinFormat("0000")).toBe(true);
  });

  it("rejects wrong length or non-digits", () => {
    expect(isValidPinFormat("123")).toBe(false);
    expect(isValidPinFormat("12345")).toBe(false);
    expect(isValidPinFormat("12a4")).toBe(false);
    expect(isValidPinFormat("")).toBe(false);
    expect(PIN_LENGTH).toBe(4);
  });
});

describe("hashPin / verifyPin", () => {
  it("verifies the correct PIN", () => {
    const { hash, salt } = hashPin("1234");
    expect(verifyPin("1234", hash, salt)).toBe(true);
  });

  it("rejects a wrong PIN", () => {
    const { hash, salt } = hashPin("1234");
    expect(verifyPin("4321", hash, salt)).toBe(false);
  });

  it("uses a random salt — same PIN hashes differently each time", () => {
    const a = hashPin("1234");
    const b = hashPin("1234");
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
    // …but both still verify.
    expect(verifyPin("1234", a.hash, a.salt)).toBe(true);
    expect(verifyPin("1234", b.hash, b.salt)).toBe(true);
  });

  it("returns false on malformed stored hash without throwing", () => {
    expect(verifyPin("1234", "deadbeef", "abc")).toBe(false);
  });
});
