import { Controller, Get, Post, Body, Param, Logger, OnModuleInit, Headers, Res, BadRequestException } from '@nestjs/common';
import { MessagePattern, Ctx, RmqContext, Payload } from '@nestjs/microservices';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { WebhooksService } from '../webhooks/webhooks.service';

// Use a publish queue for reservation events that subscribers listen on
const RMQ_QUEUE = process.env.RABBITMQ_QUEUE_PUBLISH || 'spaces_queue';

@Controller('reservations')
export class ReservationsController implements OnModuleInit {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly webhooks: WebhooksService,
  ) {}

  private readonly logger = new Logger(ReservationsController.name);
  private client: ClientProxy;

  onModuleInit() {
    const rmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    // Create a publisher client without declaring queues to avoid queue arg conflicts
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        // Do not set `queue` or `queueOptions` here — this client will be used only for emitting events
      },
    });
  }

  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Headers('x-idempotency-key') idempotencyHeader?: string,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<Reservation> {
    // Prefer header `x-idempotency-key`, fall back to body property, else generate one
    let idempotencyKey = idempotencyHeader || (createReservationDto as any).idempotencyKey;
    if (!idempotencyKey) {
      idempotencyKey = uuidv4();
      this.logger.log(`No idempotency key provided — generated ${idempotencyKey}`);
    }

    const reservation = await this.reservationsService.create(createReservationDto, idempotencyKey);

    const payload = {
      reservationId: reservation.id,
      spaceId: createReservationDto.spaceId,
      idempotencyKey,
    };

    try {
      await this.client.emit('reservation.created', payload).toPromise();
      this.logger.log(`Emitted reservation.created for ${reservation.id}`);
    } catch (err) {
      this.logger.error('Error emitting reservation.created', err as any);
    }

    this.webhooks
      .publishReservationCreated(reservation, idempotencyKey)
      .catch((err) => this.logger.error('Error enviando webhooks', err as any));

    try {
      if (res && idempotencyKey) res.setHeader('x-idempotency-key', idempotencyKey);
    } catch (e) {
      this.logger.warn('Could not set idempotency header on response', e as any);
    }

    return reservation;
  }

  // Accept create requests via RMQ (gateway sends create_reservation)
  @MessagePattern('create_reservation')
  async handleCreateReservation(@Payload() payload: any, @Ctx() context: RmqContext): Promise<Reservation> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const { data, idempotencyKey } = payload || {};
    const createDto: CreateReservationDto = data;
    const effectiveKey = idempotencyKey || uuidv4();
    if (!idempotencyKey) {
      this.logger.log(`RMQ handler: no idempotency key in payload — generated ${effectiveKey}`);
    }

    try {
      const reservation = await this.reservationsService.create(createDto, effectiveKey);

      const msg = {
        reservationId: reservation.id,
        spaceId: reservation.spaceId,
        idempotencyKey: effectiveKey,
      };

      // Ack early to avoid channel/ack races (ensure we don't ack/nack twice)
      let acknowledged = false;
      try {
        if (originalMsg) {
          channel.ack(originalMsg);
          acknowledged = true;
        } else {
          this.logger.warn('Original RMQ message not available to ack');
        }
      } catch (e) {
        this.logger.error('Error acking message', e as any);
      }

      // Publish event asynchronously — do not block the handler on publisher channels
      this.client.emit('reservation.created', msg).toPromise()
        .then(() => this.logger.log(`Emitted reservation.created for ${reservation.id} (via RMQ handler)`))
        .catch((err) => this.logger.error('Error emitting reservation.created', err as any));

      // Webhooks de salida (no bloquean el ACK)
      this.webhooks
        .publishReservationCreated(reservation, effectiveKey)
        .catch((err) => this.logger.error('Error enviando webhooks', err as any));

      return reservation;
    } catch (err) {
      this.logger.error('Error in RMQ create_reservation handler', err as any);
      // Validation errors -> ack and drop (do not requeue)
      if (err instanceof BadRequestException) {
        try {
          if (originalMsg) {
            channel.ack(originalMsg);
          } else {
            this.logger.warn('Original RMQ message not available to ack invalid message');
          }
        } catch (e) {
          this.logger.error('Error acking invalid message', e as any);
        }
        throw err;
      }

      // For other errors, nack with requeue=true (allow retry)
      try {
        if (originalMsg) {
          channel.nack(originalMsg, false, true);
        } else {
          this.logger.warn('Original RMQ message not available to nack');
        }
      } catch (e) {
        this.logger.error('Error nack message', e as any);
      }

      throw err;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Reservation> {
    return this.reservationsService.findOne(Number(id));
  }

  @Get()
  findAll(): Promise<Reservation[]> {
    return this.reservationsService.findAll();
  }
}