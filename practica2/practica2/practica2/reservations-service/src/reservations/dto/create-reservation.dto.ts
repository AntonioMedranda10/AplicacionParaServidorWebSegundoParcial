export class CreateReservationDto {
  readonly userId: number | string;
  readonly spaceId: number | string;
  readonly startDate: string | Date;
  readonly endDate: string | Date;
  readonly guests?: number;
}