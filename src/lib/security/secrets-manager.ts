import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand, CreateSecretCommand, UpdateSecretCommand, RotateSecretCommand } from '@aws-sdk/client-secrets-manager';
import * as vault from 'node-vault';
import crypto from 'crypto';

export interface SecretConfig {
  provider: 'aws' | 'vault' | 'env';
  awsConfig?: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
  vaultConfig?: {
    endpoint: string;
    token?: string;
    roleId?: string;
    secretId?: string;
  };
}

export interface Secret {
  key: string;
  value: string;
  version?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  tags?: Map<string, string>;
}

export interface SecretRotationConfig {
  rotationInterval: number; // days
  autoRotate: boolean;
  notificationEndpoint?: string;
}

export class SecretsManager {
  private awsClient?: SecretsManagerClient;
  private vaultClient?: any;
  private config: SecretConfig;
  private secretCache: Map<string, { secret: Secret; cacheTime: Date }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(config?: SecretConfig) {
    this.config = config || {
      provider: process.env.SECRETS_PROVIDER as 'aws' | 'vault' | 'env' || 'env'
    };

    this.initializeProvider();
  }

  private initializeProvider(): void {
    switch (this.config.provider) {
      case 'aws':
        this.initializeAWS();
        break;
      case 'vault':
        this.initializeVault();
        break;
      case 'env':
        // Environment variables - no initialization needed
        break;
    }
  }

  private initializeAWS(): void {
    if (!this.config.awsConfig) {
      throw new Error('AWS configuration required for AWS Secrets Manager');
    }

    this.awsClient = new SecretsManagerClient({
      region: this.config.awsConfig.region,
      credentials: this.config.awsConfig.accessKeyId ? {
        accessKeyId: this.config.awsConfig.accessKeyId,
        secretAccessKey: this.config.awsConfig.secretAccessKey!
      } : undefined
    });
  }

  private initializeVault(): void {
    if (!this.config.vaultConfig) {
      throw new Error('Vault configuration required for HashiCorp Vault');
    }

    this.vaultClient = vault({
      endpoint: this.config.vaultConfig.endpoint,
      token: this.config.vaultConfig.token
    });
  }

  async getSecret(key: string): Promise<string> {
    // Check cache first
    const cached = this.secretCache.get(key);
    if (cached && Date.now() - cached.cacheTime.getTime() < this.CACHE_TTL) {
      return cached.secret.value;
    }

    let secretValue: string;

    switch (this.config.provider) {
      case 'aws':
        secretValue = await this.getAWSSecret(key);
        break;
      case 'vault':
        secretValue = await this.getVaultSecret(key);
        break;
      case 'env':
        secretValue = await this.getEnvSecret(key);
        break;
      default:
        throw new Error(`Unsupported secrets provider: ${this.config.provider}`);
    }

    // Cache the secret
    this.secretCache.set(key, {
      secret: {
        key,
        value: secretValue,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      cacheTime: new Date()
    });

    return secretValue;
  }

  private async getAWSSecret(key: string): Promise<string> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager not initialized');
    }

    const command = new GetSecretValueCommand({ SecretId: key });
    const response = await this.awsClient.send(command);
    return response.SecretString || '';
  }

  private async getVaultSecret(key: string): Promise<string> {
    if (!this.vaultClient) {
      throw new Error('HashiCorp Vault not initialized');
    }

    // Authenticate with AppRole if configured
    if (this.config.vaultConfig?.roleId && this.config.vaultConfig?.secretId) {
      const authResponse = await this.vaultClient.approleLogin({
        role_id: this.config.vaultConfig.roleId,
        secret_id: this.config.vaultConfig.secretId
      });
      this.vaultClient.token = authResponse.auth.client_token;
    }

    const response = await this.vaultClient.read(`secret/data/${key}`);
    return response.data.data.value;
  }

  private async getEnvSecret(key: string): Promise<string> {
    const value = process.env[key.toUpperCase().replace('-', '_')];
    if (!value) {
      throw new Error(`Environment variable ${key} not found`);
    }
    return value;
  }

  async storeSecret(key: string, value: string, tags?: Map<string, string>): Promise<void> {
    switch (this.config.provider) {
      case 'aws':
        await this.storeAWSSecret(key, value, tags);
        break;
      case 'vault':
        await this.storeVaultSecret(key, value, tags);
        break;
      case 'env':
        throw new Error('Cannot store secrets in environment variables');
      default:
        throw new Error(`Unsupported secrets provider: ${this.config.provider}`);
    }

    // Invalidate cache
    this.secretCache.delete(key);
  }

  private async storeAWSSecret(key: string, value: string, tags?: Map<string, string>): Promise<void> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager not initialized');
    }

    try {
      // Try to update existing secret
      const updateCommand = new UpdateSecretCommand({
        SecretId: key,
        SecretString: value
      });
      await this.awsClient.send(updateCommand);
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        // Create new secret
        const createCommand = new CreateSecretCommand({
          Name: key,
          SecretString: value,
          Tags: tags ? Array.from(tags.entries()).map(([Key, Value]) => ({ Key, Value })) : undefined
        });
        await this.awsClient.send(createCommand);
      } else {
        throw error;
      }
    }
  }

  private async storeVaultSecret(key: string, value: string, tags?: Map<string, string>): Promise<void> {
    if (!this.vaultClient) {
      throw new Error('HashiCorp Vault not initialized');
    }

    const data: any = { value };
    if (tags) {
      data.metadata = Object.fromEntries(tags);
    }

    await this.vaultClient.write(`secret/data/${key}`, { data });
  }

  async rotateSecret(key: string, config?: SecretRotationConfig): Promise<string> {
    const newValue = this.generateSecureSecret();
    
    switch (this.config.provider) {
      case 'aws':
        await this.rotateAWSSecret(key);
        break;
      case 'vault':
        await this.storeVaultSecret(key, newValue);
        break;
      case 'env':
        throw new Error('Cannot rotate environment variable secrets');
      default:
        throw new Error(`Unsupported secrets provider: ${this.config.provider}`);
    }

    // Invalidate cache
    this.secretCache.delete(key);
    
    return newValue;
  }

  private async rotateAWSSecret(key: string): Promise<void> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager not initialized');
    }

    const command = new RotateSecretCommand({
      SecretId: key,
      ForceRotateSecrets: true
    });
    await this.awsClient.send(command);
  }

  private generateSecureSecret(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let secret = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      secret += charset[randomIndex];
    }
    
    return secret;
  }

  async listSecrets(prefix?: string): Promise<string[]> {
    switch (this.config.provider) {
      case 'aws':
        return await this.listAWSSecrets(prefix);
      case 'vault':
        return await this.listVaultSecrets(prefix);
      case 'env':
        return this.listEnvSecrets(prefix);
      default:
        throw new Error(`Unsupported secrets provider: ${this.config.provider}`);
    }
  }

  private async listAWSSecrets(prefix?: string): Promise<string[]> {
    // AWS Secrets Manager list implementation
    return [];
  }

  private async listVaultSecrets(prefix?: string): Promise<string[]> {
    if (!this.vaultClient) {
      throw new Error('HashiCorp Vault not initialized');
    }

    const response = await this.vaultClient.list('secret/metadata/');
    let secrets = response.data.keys || [];
    
    if (prefix) {
      secrets = secrets.filter((secret: string) => secret.startsWith(prefix));
    }
    
    return secrets;
  }

  private listEnvSecrets(prefix?: string): string[] {
    const envVars = Object.keys(process.env);
    if (prefix) {
      const prefixUpper = prefix.toUpperCase().replace('-', '_');
      return envVars.filter(key => key.startsWith(prefixUpper));
    }
    return envVars;
  }

  async deleteSecret(key: string): Promise<void> {
    switch (this.config.provider) {
      case 'aws':
        await this.deleteAWSSecret(key);
        break;
      case 'vault':
        await this.deleteVaultSecret(key);
        break;
      case 'env':
        throw new Error('Cannot delete environment variable secrets');
      default:
        throw new Error(`Unsupported secrets provider: ${this.config.provider}`);
    }

    // Remove from cache
    this.secretCache.delete(key);
  }

  private async deleteAWSSecret(key: string): Promise<void> {
    // AWS secret deletion implementation
  }

  private async deleteVaultSecret(key: string): Promise<void> {
    if (!this.vaultClient) {
      throw new Error('HashiCorp Vault not initialized');
    }

    await this.vaultClient.delete(`secret/data/${key}`);
  }

  // Key Management for Application Encryption
  async getEncryptionKey(keyId: string): Promise<Buffer> {
    const keyString = await this.getSecret(`encryption-key-${keyId}`);
    return Buffer.from(keyString, 'hex');
  }

  async generateEncryptionKey(keyId: string, keySize: number = 32): Promise<Buffer> {
    const key = crypto.randomBytes(keySize);
    await this.storeSecret(`encryption-key-${keyId}`, key.toString('hex'));
    return key;
  }

  async rotateKeys(keyId: string): Promise<Buffer> {
    const newKey = crypto.randomBytes(32);
    await this.storeSecret(`encryption-key-${keyId}`, newKey.toString('hex'));
    return newKey;
  }

  // JWT Secret Management
  async getJWTSecret(): Promise<string> {
    return await this.getSecret('jwt-secret');
  }

  async rotateJWTSecret(): Promise<string> {
    const newSecret = this.generateSecureSecret(64);
    await this.storeSecret('jwt-secret', newSecret);
    return newSecret;
  }

  // Database Connection Secrets
  async getDatabaseCredentials(dbName: string): Promise<{ username: string; password: string; host: string; port: number }> {
    const credentials = await this.getSecret(`database-${dbName}`);
    return JSON.parse(credentials);
  }

  // API Key Management
  async getAPIKey(service: string): Promise<string> {
    return await this.getSecret(`api-key-${service}`);
  }

  async generateAPIKey(service: string): Promise<string> {
    const apiKey = this.generateSecureSecret(48);
    await this.storeSecret(`api-key-${service}`, apiKey);
    return apiKey;
  }

  // TLS Certificate Management
  async getTLSCertificate(domain: string): Promise<{ cert: string; key: string }> {
    const certData = await this.getSecret(`tls-cert-${domain}`);
    return JSON.parse(certData);
  }

  async storeTLSCertificate(domain: string, cert: string, key: string): Promise<void> {
    await this.storeSecret(`tls-cert-${domain}`, JSON.stringify({ cert, key }));
  }

  // Health Check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; provider: string; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'aws':
          if (!this.awsClient) return { status: 'unhealthy', provider: 'aws', error: 'Client not initialized' };
          // Test AWS connection
          await this.awsClient.send(new GetSecretValueCommand({ SecretId: 'health-check' }));
          break;
        case 'vault':
          if (!this.vaultClient) return { status: 'unhealthy', provider: 'vault', error: 'Client not initialized' };
          // Test Vault connection
          await this.vaultClient.read('sys/health');
          break;
        case 'env':
          // Environment variables are always available
          break;
      }
      
      return { status: 'healthy', provider: this.config.provider };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        provider: this.config.provider, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Cache Management
  clearCache(): void {
    this.secretCache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.secretCache.size,
      keys: Array.from(this.secretCache.keys())
    };
  }
}