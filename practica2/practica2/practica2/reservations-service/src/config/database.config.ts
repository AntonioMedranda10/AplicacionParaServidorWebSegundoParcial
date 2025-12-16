import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { IdempotencyKey } from '../reservations/entities/idempotency.entity';
import { WebhookSubscription } from '../webhooks/entities/webhook-subscription.entity';
import { WebhookEvent } from '../webhooks/entities/webhook-event.entity';
import { WebhookDelivery } from '../webhooks/entities/webhook-delivery.entity';
import { ProcessedWebhook } from '../webhooks/entities/processed-webhook.entity';

const defaultConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'user_reservations',
  password: process.env.DB_PASSWORD || 'password_reservations',
  database: process.env.DB_NAME || 'db_reservations',
  entities: [Reservation, IdempotencyKey, WebhookSubscription, WebhookEvent, WebhookDelivery, ProcessedWebhook],
  synchronize: true,
};

export const databaseConfig: TypeOrmModuleOptions = process.env.DATABASE_URL
  ? ({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Reservation, IdempotencyKey, WebhookSubscription, WebhookEvent, WebhookDelivery, ProcessedWebhook],
      synchronize: true,
    } as TypeOrmModuleOptions)
  : defaultConfig;