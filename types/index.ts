export type Provider = 'stripe' | 'aws' | 'google' | 'github' | 'openai' | 'other';
export type Environment = 'production' | 'staging' | 'development';

export interface ApiKeyData {
  _id?: string;
  userId: string;
  label: string;
  encryptedKey: string;
  notes?: string;
  tags?: string[];
  provider: Provider;
  environment: Environment;
  createdAt?: Date;
  updatedAt?: Date;
  lastAccessed?: Date;
}
