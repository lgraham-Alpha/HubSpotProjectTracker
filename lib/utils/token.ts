import { randomBytes } from 'crypto'

/**
 * Generate a cryptographically secure random token
 * @returns A 32-byte token encoded as hex (64 characters)
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Validate token format (basic check)
 */
export function isValidTokenFormat(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token)
}
