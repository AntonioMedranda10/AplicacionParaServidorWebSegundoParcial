import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspacioService } from './espacio.service';
import { EspacioController } from './espacio.controller';
import { Espacio } from './entities/espacio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Espacio])], // Registramos la entidad
  controllers: [EspacioController],
  providers: [EspacioService],
  exports: [EspacioService] 
})
export class EspacioModule {}