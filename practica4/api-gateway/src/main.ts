// --------------------------------------------------------
// PARCHE OBLIGATORIO PARA FECHA INCORRECTA (2026)
// --------------------------------------------------------
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 
// --------------------------------------------------------

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors(); 

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API Gateway corriendo en puerto ${port}`);
}
bootstrap();