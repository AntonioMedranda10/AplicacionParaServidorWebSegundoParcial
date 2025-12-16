// Shared event contracts for reservations
export interface ReservationCreatedEvent {
  type: 'reservation.created';
  reservationId: number | string;
  spaceId: number | string;
  idempotencyKey?: string;
}
