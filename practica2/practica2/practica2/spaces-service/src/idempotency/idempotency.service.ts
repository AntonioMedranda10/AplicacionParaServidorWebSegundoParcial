import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis'; // Importa el constructor de Redis como 'default'

@Injectable()
export class IdempotencyService implements OnModuleDestroy {
  private readonly logger = new Logger(IdempotencyService.name);
  // CORRECCIÓN: Usar el tipo directamente. El tipo exportado por ioredis es solo 'Redis'.
  private client: Redis; 
  private processedCount = 0;
  private duplicateCount = 0;

  constructor() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    // El constructor de Redis se usa aquí
    this.client = new Redis(url); 
    this.client.on('error', (err) => this.logger.error('Redis error', err));
  }

  async markIfNotProcessed(key: string, ttlSeconds = 86400): Promise<boolean> {
    // SET key value NX EX ttl  => returns 'OK' if set, null if already exists
    const res = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
    const ok = res === 'OK';
    if (ok) this.processedCount += 1;
    else this.duplicateCount += 1;
    return ok;
  }

  async isProcessed(key: string): Promise<boolean> {
    const val = await this.client.get(key);
    return val !== null;
  }

  getMetrics() {
    return {
      processed: this.processedCount,
      duplicates: this.duplicateCount,
    };
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch (err) {
      this.logger.warn('Error closing Redis client', err);
    }
  }
}