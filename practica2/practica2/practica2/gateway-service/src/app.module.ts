import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './api/controllers/gateway.controller';
import { HealthController } from './api/controllers/health.controller';
import { ReservationsClient } from './clients/reservations.client';
import { SpacesClient } from './clients/spaces.client';
import { Transport } from '@nestjs/microservices';
import { transportConfig } from './config/transport.config';

@Module({
  imports: [HttpModule],
  controllers: [GatewayController, HealthController],
  providers: [
    ReservationsClient,
    SpacesClient,
    {
      provide: 'RESERVATIONS_SERVICE',
      useFactory: () => ({
        transport: Transport.RMQ,
        options: transportConfig.reservations,
      }),
    },
    {
      provide: 'SPACES_SERVICE',
      useFactory: () => ({
        transport: Transport.RMQ,
        options: transportConfig.spaces,
      }),
    },
  ],
})
export class AppModule {}