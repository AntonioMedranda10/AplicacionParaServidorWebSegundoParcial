export class CreateReservationDto {
  readonly userId: string;
  readonly spaceId: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly guests: number;
}