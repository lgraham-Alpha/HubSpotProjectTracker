/**
 * Generate a cryptographically secure random token using the Web Crypto API.
 * Works in Node.js (18+), browser, and edge runtimes.
 * @returns A 32-byte token encoded as hex (64 characters)
 */
export function generateSecureToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

/** Validate token format (basic check) */
export function isValidTokenFormat(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token)
}
