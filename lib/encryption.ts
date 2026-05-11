'use client';

import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static generateKey(masterPassword: string, salt: string): string {
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  }

  static encrypt(data: string, masterPassword: string): string {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const key = this.generateKey(masterPassword, salt);
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const encryptedData = {
        salt: salt,
        iv: iv.toString(),
        encrypted: encrypted.toString(),
      };

      return btoa(JSON.stringify(encryptedData));
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decrypt(encryptedData: string, masterPassword: string): string {
    try {
      const data = JSON.parse(atob(encryptedData));
      const key = this.generateKey(masterPassword, data.salt);
      
      const decrypted = CryptoJS.AES.decrypt(data.encrypted, key, {
        iv: CryptoJS.enc.Hex.parse(data.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Invalid master password');
      }

      return decryptedText;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  static maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
      return '*'.repeat(apiKey.length);
    }
    
    const start = apiKey.substring(0, 4);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '*'.repeat(Math.max(0, apiKey.length - 8));
    
    return start + middle + end;
  }
}