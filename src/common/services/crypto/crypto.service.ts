import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('ENCRYPTION_SECRET');
    if (!secret) {
      throw new Error(
        'ENCRYPTION_SECRET is not defined in environment variables',
      );
    }
    // Derive a 32-byte key using scrypt (or use a direct 32-byte key)
    this.key = scryptSync(secret, 'salt', 32);
  }

  /**
   * Encrypts a plaintext string using AES-256-GCM.
   * @param text - Plain text to encrypt
   * @returns Base64 encoded string containing IV, auth tag, and encrypted data
   */
  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Combine IV + AuthTag + Encrypted data, then base64 encode
    const result = Buffer.concat([iv, authTag, encrypted]);
    return result.toString('base64');
  }

  /**
   * Decrypts an encrypted string produced by the encrypt method.
   * @param encryptedData - Base64 encoded encrypted string
   * @returns Decrypted plain text
   */
  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const iv = buffer.subarray(0, 16);
    const authTag = buffer.subarray(16, 32);
    const encrypted = buffer.subarray(32);

    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
