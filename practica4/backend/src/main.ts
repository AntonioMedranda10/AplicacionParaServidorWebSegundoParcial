import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilitar validaciones globales
  app.useGlobalPipes(new ValidationPipe()); 
  await app.listen(3002);
  console.log('Backend corriendo en puerto 3002');
}
bootstrap();
