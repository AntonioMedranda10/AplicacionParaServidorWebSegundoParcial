import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { SpacesService } from './spaces.service';
import { IdempotencyService } from '../idempotency/idempotency.service';

@Controller()
export class SpacesConsumer {
  private readonly logger = new Logger(SpacesConsumer.name);

  constructor(
    private readonly spacesService: SpacesService,
    private readonly idempotency: IdempotencyService,
  ) {}

  @EventPattern('reservation.created')
  async handleReservation(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const idempotencyKey = data?.idempotencyKey || data?.idempotency?.key;
    if (!idempotencyKey) {
      this.logger.warn('Incoming message without idempotency key — processing anyway');
    }

    const key = `processed:${idempotencyKey}`;
    try {
      if (idempotencyKey) {
        const set = await this.idempotency.markIfNotProcessed(key, 24 * 60 * 60);
        if (!set) {
          this.logger.log(`Duplicate message detected (idempotency=${idempotencyKey}), acking`);
          channel.ack(originalMsg);
          return;
        }
      }

      // Business logic: apply reservation to space (decrement capacity, etc.)
      await this.spacesService.applyReservation(data);

      this.logger.log(`Processed reservation ${data?.reservationId || 'unknown'}`);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error('Error processing reservation', err as any);
      try {
        const deathHeader = originalMsg?.properties?.headers?.['x-death'];
        let attempts = 0;
        if (Array.isArray(deathHeader) && deathHeader.length > 0) {
          attempts = deathHeader.reduce((acc: number, d: any) => acc + (d.count || 0), 0);
        }

        const MAX_RETRIES = 3;
        if (attempts >= MAX_RETRIES) {
          this.logger.warn(`Message reached max retries (${attempts}). Sending to DLX (nack requeue=false)`);
          channel.nack(originalMsg, false, false); // send to DLX
        } else {
          this.logger.log(`Nacking message for retry (attempt ${attempts + 1})`);
          channel.nack(originalMsg, false, true); // requeue
        }
      } catch (e) {
        this.logger.error('Error ack/nack message', e as any);
      }
    }
  }
}
