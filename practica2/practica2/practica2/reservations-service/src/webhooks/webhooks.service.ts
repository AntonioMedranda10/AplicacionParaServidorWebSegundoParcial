import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { ProcessedWebhook } from './entities/processed-webhook.entity';

type WebhookPayload = Record<string, unknown>;

@Injectable()
export class WebhooksService implements OnModuleInit {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(WebhookSubscription)
    private readonly subsRepo: Repository<WebhookSubscription>,
    @InjectRepository(WebhookEvent)
    private readonly eventsRepo: Repository<WebhookEvent>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveriesRepo: Repository<WebhookDelivery>,
    @InjectRepository(ProcessedWebhook)
    private readonly processedRepo: Repository<ProcessedWebhook>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultSubscriptions();
  }

  async publishReservationCreated(reservation: any, idempotencyKey: string) {
    const eventId = uuidv4();
    const payload: WebhookPayload = {
      event: 'reservation.created',
      version: '1.0',
      id: eventId,
      idempotency_key: idempotencyKey,
      timestamp: new Date().toISOString(),
      data: {
        reservation_id: reservation?.id,
        space_id: reservation?.spaceId,
        user_id: reservation?.userId,
        start_date: reservation?.startDate,
        end_date: reservation?.endDate,
      },
      metadata: {
        source: 'reservations-service',
        environment: process.env.NODE_ENV || 'local',
        correlation_id: idempotencyKey,
      },
    };

    await this.eventsRepo.save({
      eventId,
      eventType: 'reservation.created',
      idempotencyKey,
      payload,
      metadata: payload.metadata as Record<string, unknown>,
    });

    const subs = await this.subsRepo.find({ where: { eventType: 'reservation.created', isActive: true } });
    if (!subs.length) {
      this.logger.warn('No hay suscripciones activas para reservation.created');
      return;
    }

    await Promise.allSettled(subs.map((sub) => this.deliverToSubscriber(sub, payload)));

    await this.eventsRepo.update({ eventId }, { processedAt: new Date() });
  }

  private async deliverToSubscriber(sub: WebhookSubscription, payload: WebhookPayload) {
    const signature = this.generateSignature(payload, sub.secret);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const backoff = [1000, 2000, 4000, 8000, 16000, 32000]; // ms; compact for demo

    for (let attempt = 1; attempt <= backoff.length; attempt += 1) {
      const started = Date.now();
      try {
        const res = await axios.post(sub.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': timestamp,
            'X-Webhook-Idempotency-Key': payload.idempotency_key as string,
            'User-Agent': 'reservations-service-webhook/1.0',
          },
          timeout: 5000,
        });

        await this.deliveriesRepo.save({
          subscriptionId: sub.id,
          eventId: payload.id as string,
          attemptNumber: attempt,
          statusCode: res.status,
          status: 'success',
          durationMs: Date.now() - started,
        });

        this.logger.log(`Webhook entregado a ${sub.url} intento ${attempt}`);
        return;
      } catch (err: any) {
        const statusCode = err?.response?.status;
        const errorMessage = err?.message || 'Unknown error';
        await this.deliveriesRepo.save({
          subscriptionId: sub.id,
          eventId: payload.id as string,
          attemptNumber: attempt,
          statusCode,
          status: 'failed',
          errorMessage,
          durationMs: Date.now() - started,
        });

        this.logger.warn(`Intento ${attempt} falló para ${sub.url}: ${errorMessage}`);
        if (attempt === backoff.length) {
          this.logger.error(`Entrega fallida para ${sub.url} tras ${attempt} intentos`);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, backoff[attempt]));
      }
    }
  }

  private generateSignature(payload: WebhookPayload, secret: string): string {
    const serialized = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret).update(serialized).digest('hex');
    return `sha256=${hmac}`;
  }

  private async ensureDefaultSubscriptions() {
    const defaults: Array<{ url?: string; eventType: string; envSecret?: string }> = [
      {
        url: process.env.WEBHOOK_LOGGER_URL,
        eventType: 'reservation.created',
        envSecret: process.env.WEBHOOK_LOGGER_SECRET || process.env.WEBHOOK_SECRET,
      },
      {
        url: process.env.WEBHOOK_NOTIFIER_URL,
        eventType: 'reservation.created',
        envSecret: process.env.WEBHOOK_NOTIFIER_SECRET || process.env.WEBHOOK_SECRET,
      },
    ];

    for (const def of defaults) {
      if (!def.url || !def.envSecret) continue;

      const existing = await this.subsRepo.findOne({ where: { url: def.url, eventType: def.eventType } });
      if (existing) continue;

      await this.subsRepo.save({
        url: def.url,
        secret: def.envSecret,
        eventType: def.eventType,
        retryConfig: { max_attempts: 6, backoff_type: 'exponential', initial_delay_ms: 1000 },
      });
      this.logger.log(`Suscripción webhook registrada para ${def.url}`);
    }
  }
}