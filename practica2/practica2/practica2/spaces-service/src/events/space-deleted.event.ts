export class SpaceDeletedEvent {
  // Solo necesita el ID y, opcionalmente, la fecha de eliminación.
  constructor(public readonly id: number, public readonly deletedAt: Date = new Date()) {}
}