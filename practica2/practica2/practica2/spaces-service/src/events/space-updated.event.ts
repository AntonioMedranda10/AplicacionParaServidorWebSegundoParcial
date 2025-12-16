export class SpaceUpdatedEvent {
  // El constructor acepta los campos actualizados y una fecha opcional de actualización.
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly location: string,
    public readonly capacity: number,
    public readonly updatedAt: Date = new Date() // Si no se pasa, usa la fecha actual.
  ) {}
}