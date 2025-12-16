export class CreateReservationDto {
  espacioId?: string | number;
  fecha?: string;
  // optionally userId, idempotencyKey
  userId?: number;
  idempotencyKey?: string;
}
