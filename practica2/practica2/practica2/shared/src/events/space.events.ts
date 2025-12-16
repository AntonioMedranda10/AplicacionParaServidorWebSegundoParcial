// Shared event contracts for spaces
export interface SpaceCreatedEvent {
  type: 'space.created';
  spaceId: string;
  name: string;
  capacity: number;
}

export interface SpaceUpdatedEvent {
  type: 'space.updated';
  spaceId: string;
  name?: string;
  capacity?: number;
}

export interface SpaceDeletedEvent {
  type: 'space.deleted';
  spaceId: string;
}
