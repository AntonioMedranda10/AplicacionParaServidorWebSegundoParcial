import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesController } from './spaces.controller';
import { HealthController } from '../health/health.controller';
import { SpacesService } from './spaces.service';
import { SpacesConsumer } from './spaces.consumer';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { Space } from './entities/space.entity';

@Module({
  imports: [IdempotencyModule, TypeOrmModule.forFeature([Space])],
  controllers: [SpacesController, HealthController],
  providers: [SpacesService, SpacesConsumer],
  exports: [SpacesService],
})
export class SpacesModule {}