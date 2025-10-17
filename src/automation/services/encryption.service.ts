import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('encryption.key');
    if (encryptionKey) {
      this.key = Buffer.from(encryptionKey, 'hex');
    }
  }

  encrypt(text: string): { encryptedData: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
    };
  }

  decrypt(encryptedData: string, iv: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex'),
    );

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  encryptCardData(cardData: {
    cardNumber: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
  }): any {
    const cardNumberEncrypted = this.encrypt(cardData.cardNumber);
    const cvvEncrypted = this.encrypt(cardData.cvv);

    return {
      cardNumber: cardNumberEncrypted,
      cvv: cvvEncrypted,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
    };
  }

  decryptCardData(encryptedCardData: any): {
    cardNumber: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
  } {
    return {
      cardNumber: this.decrypt(
        encryptedCardData.cardNumber.encryptedData,
        encryptedCardData.cardNumber.iv,
      ),
      cvv: this.decrypt(
        encryptedCardData.cvv.encryptedData,
        encryptedCardData.cvv.iv,
      ),
      expiryMonth: encryptedCardData.expiryMonth,
      expiryYear: encryptedCardData.expiryYear,
    };
  }
}
