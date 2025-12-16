import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesModule } from './spaces/spaces.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { Space } from './spaces/entities/space.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || process.env.DATABASE_URL_SPACES,
      host: process.env.DB_HOST || 'postgres-spaces',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || process.env.DATABASE_NAME_SPACES || 'spaces_db',
      entities: [Space],
      synchronize: true,
    }),
    SpacesModule,
    IdempotencyModule,
  ],
})
export class AppModule {}