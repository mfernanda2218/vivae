import { createHmac, createHash, timingSafeEqual } from 'crypto';

/**
 * Generates a cryptographically signed QR token
 * Format: timestamp.random.signature
 */
export function generateQrToken(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const signature = createQrSignature(timestamp, random);
  return `${timestamp}.${random}.${signature}`;
}

/**
 * Creates HMAC signature for QR token
 */
export function createQrSignature(timestamp: number, random: string): string {
  const secret = process.env.JWT_SECRET || 'vivae-dev-secret';
  const payload = `${timestamp}:${random}`;
  return createHmac('sha256', secret).update(payload).digest('hex').substring(0, 16);
}

/**
 * Verifies QR token signature using timing-safe comparison
 */
export function verifyQrSignature(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [timestamp, random, signature] = parts;
    const expectedSignature = createQrSignature(parseInt(timestamp), random);
    
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Hashes a token for storage/comparison
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
