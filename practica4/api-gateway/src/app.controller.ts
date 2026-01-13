import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini/gemini.service';

@Controller('api')
export class AppController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('procesar')
  async procesar(@Body('mensaje') mensaje: string) {
    // Si no llega mensaje, lanzamos error o devolvemos aviso
    if (!mensaje) return { error: "Debes enviar un mensaje" };

    const respuesta = await this.geminiService.procesarSolicitud(mensaje);
    return { 
      respuesta_ia: respuesta 
    };
  }
}