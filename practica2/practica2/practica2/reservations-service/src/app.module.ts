import { Module } from '@nestjs/common';
import { ReservationsModule } from './reservations/reservations.module';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    ReservationsModule,
  ],
})
export class AppModule {}