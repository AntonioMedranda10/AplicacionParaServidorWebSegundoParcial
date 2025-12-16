import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { HealthController } from '../health/health.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { IdempotencyKey } from './entities/idempotency.entity';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, IdempotencyKey]), WebhooksModule],
  controllers: [ReservationsController, HealthController],
  providers: [ReservationsService],
})
export class ReservationsModule {}