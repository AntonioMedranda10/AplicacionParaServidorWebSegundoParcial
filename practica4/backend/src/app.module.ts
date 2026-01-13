import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//import { ReservaModule } from './reserva/reserva.module'; 
import { EspacioModule } from './espacio/espacio.module';
import { ReservaModule } from './reserva/reserva.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/inventario.db', 
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, 
    }),
    EspacioModule,
    ReservaModule,
    // ReservaModule (Lo descomentaremos cuando lo creemos)
  ],
})
export class AppModule {}