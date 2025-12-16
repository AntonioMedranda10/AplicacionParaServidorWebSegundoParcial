import { Controller, Get, Post, Body, Param, Headers, Res, BadRequestException } from '@nestjs/common';
import { SpacesClient } from '../../clients/spaces.client';
import { ReservationsClient } from '../../clients/reservations.client';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';

@Controller('gateway')
export class GatewayController {
  constructor(
    private readonly spacesClient: SpacesClient,
    private readonly reservationsClient: ReservationsClient,
  ) {}

  @Get('spaces')
  async getSpaces() {
    return this.spacesClient.getAllSpaces();
  }

  @Post('reservations')
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const key = idempotencyKey || (createReservationDto as any).idempotencyKey || uuidv4();
    if (!idempotencyKey && !(createReservationDto as any).idempotencyKey) {
      // Log generation; Gateway doesn't set response header here but ensures downstream gets key
      // (Controllers/services may log or return it as needed)
      // eslint-disable-next-line no-console
      console.log(`Gateway generated idempotency key: ${key}`);
    }
    // Normalize payload fields to the reservations-service expected shape
    const normalized: any = {
      spaceId:
        (createReservationDto as any).spaceId ?? (createReservationDto as any).espacioId ?? (createReservationDto as any).space_id,
      userId: (createReservationDto as any).userId ?? (createReservationDto as any).user_id ?? 0,
      startDate:
        (createReservationDto as any).from ?? (createReservationDto as any).startDate ?? (createReservationDto as any).fecha ?? null,
      endDate: (createReservationDto as any).to ?? (createReservationDto as any).endDate ?? null,
    };

    // Ensure dates are ISO strings or Date objects
    if (normalized.startDate && !(normalized.startDate instanceof Date)) normalized.startDate = new Date(normalized.startDate);
    if (normalized.endDate && !(normalized.endDate instanceof Date)) normalized.endDate = new Date(normalized.endDate);

    // Validate required fields and types
    const spaceIdNum = Number(normalized.spaceId);
    if (Number.isNaN(spaceIdNum)) throw new BadRequestException('spaceId is required and must be a number');

    const userIdNum = Number(normalized.userId) || 0;

    if (!normalized.startDate || !(normalized.startDate instanceof Date) || Number.isNaN(normalized.startDate.getTime())) {
      throw new BadRequestException('startDate is required and must be a valid date');
    }
    if (!normalized.endDate || !(normalized.endDate instanceof Date) || Number.isNaN(normalized.endDate.getTime())) {
      throw new BadRequestException('endDate is required and must be a valid date');
    }

    const guestsNum = Number((createReservationDto as any).guests) || 1;

    const payload = {
      spaceId: spaceIdNum,
      userId: userIdNum,
      startDate: normalized.startDate,
      endDate: normalized.endDate,
      guests: guestsNum,
    };

    const result = await this.reservationsClient.createReservation(payload, key);
    try {
      if (res && key) res.setHeader('x-idempotency-key', key);
    } catch (e) {
      // avoid failing request if header cannot be set
      // eslint-disable-next-line no-console
      console.warn('Could not set idempotency header on response', e);
    }
    return result;
  }

  @Get('reservations/:id')
  async getReservation(@Param('id') id: string) {
    return this.reservationsClient.getReservation(id);
  }
}