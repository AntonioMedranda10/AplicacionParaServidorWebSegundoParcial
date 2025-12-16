export class SpaceCreatedEvent {
  // El constructor ahora acepta las fechas como parámetros opcionales.
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly location: string,
    public readonly capacity: number,
    public readonly createdAt: Date = new Date() // Si no se pasa, usa la fecha actual.
  ) {}
}