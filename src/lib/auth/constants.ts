// Shared auth constants (importable from both edge middleware and node actions,
// so no node:crypto / server-only here).

/** Session cookie set once the parent passes the PIN gate; cleared on sign-out
 *  and whenever the user drops into child mode (forces PIN re-entry on return). */
export const PIN_OK_COOKIE = "ola_parent_pin_ok";

/** Gate PINs are exactly 4 digits. */
export const PIN_LENGTH = 4;

/** A 4-digit string, nothing else. */
export function isValidPinFormat(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}
