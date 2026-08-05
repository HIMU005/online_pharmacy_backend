import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  private readonly SALT_ROUNDS = 12;

  /**
   * Hash plain text (password or OTP)
   */
  async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.SALT_ROUNDS);
  }

  /**
   * Compare plain text with hash
   */
  async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }

  /**
   * Generate random string (optional helper)
   */
  generateRandomString(length = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}
