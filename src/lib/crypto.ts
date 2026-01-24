/**
 * Cryptographic utilities for email handling
 * Uses Web Crypto API for SHA-256 hashing and AES-256-GCM encryption
 */

// Check if encryption is configured
export const isEncryptionConfigured = Boolean(process.env.EMAIL_ENCRYPTION_KEY);

/**
 * Hash an email address using SHA-256
 * Normalizes email (lowercase, trimmed) before hashing
 */
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypt an email address using AES-256-GCM
 * Returns the encrypted data and IV as hex strings
 */
export async function encryptEmail(email: string): Promise<{ encrypted: string; iv: string }> {
  const encryptionKey = process.env.EMAIL_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('EMAIL_ENCRYPTION_KEY environment variable is not set');
  }

  // Convert hex key to bytes
  const keyBytes = new Uint8Array(
    encryptionKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  // Import the key
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the email
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Convert to hex strings
  const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
  const encrypted = encryptedArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

  return { encrypted, iv: ivHex };
}

/**
 * Decrypt an email address using AES-256-GCM
 * Takes the encrypted data and IV as hex strings
 */
export async function decryptEmail(encrypted: string, iv: string): Promise<string> {
  const encryptionKey = process.env.EMAIL_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('EMAIL_ENCRYPTION_KEY environment variable is not set');
  }

  // Convert hex strings to bytes
  const keyBytes = new Uint8Array(
    encryptionKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  const encryptedBytes = new Uint8Array(
    encrypted.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  const ivBytes = new Uint8Array(
    iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  // Import the key
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    encryptedBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
