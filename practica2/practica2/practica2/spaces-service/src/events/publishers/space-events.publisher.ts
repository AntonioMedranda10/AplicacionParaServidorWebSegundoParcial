import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { SpaceCreatedEvent } from '../space-created.event';
import { SpaceUpdatedEvent } from '../space-updated.event';
import { SpaceDeletedEvent } from '../space-deleted.event';
import { Space } from '../../spaces/entities/space.entity'; // Asegúrate de importar la Entidad/DTO correcta

@Injectable()
export class SpaceEventsPublisher {
  constructor(private eventEmitter: EventEmitter2) {}

  // Ahora recibe el objeto 'Space' completo
  publishSpaceCreated(space: Space) {
    const event = new SpaceCreatedEvent(space.id, space.name, space.location, space.capacity);
    this.eventEmitter.emit('space.created', event);
  }

  // Ahora recibe el objeto 'Space' completo (actualizado)
  publishSpaceUpdated(space: Space) {
    const event = new SpaceUpdatedEvent(space.id, space.name, space.location, space.capacity);
    this.eventEmitter.emit('space.updated', event);
  }

  // Solo necesita el ID
  publishSpaceDeleted(spaceId: number) { 
    const event = new SpaceDeletedEvent(spaceId);
    this.eventEmitter.emit('space.deleted', event);
  }
}
