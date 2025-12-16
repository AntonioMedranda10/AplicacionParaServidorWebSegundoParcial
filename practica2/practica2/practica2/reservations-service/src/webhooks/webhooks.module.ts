import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksService } from './webhooks.service';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { ProcessedWebhook } from './entities/processed-webhook.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebhookSubscription,
      WebhookEvent,
      WebhookDelivery,
      ProcessedWebhook,
    ]),
  ],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}