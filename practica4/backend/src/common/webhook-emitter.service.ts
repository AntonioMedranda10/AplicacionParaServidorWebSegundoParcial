import { Injectable, Logger } from '@nestjs/common';

// Emite eventos vía webhook hacia n8n. Es opcional: si no hay URL, no hace nada.
@Injectable()
export class WebhookEmitterService {
  private readonly logger = new Logger(WebhookEmitterService.name);
  private readonly n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  async emit(evento: string, payload: any): Promise<void> {
    if (!this.n8nWebhookUrl) {
      this.logger.warn('N8N_WEBHOOK_URL no está definida; se omite el envío');
      return;
    }

    try {
      const eventoNorm = (evento || '').trim().toLowerCase();

      const isConfirmada = eventoNorm === 'reserva.confirmada';

      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento,
          eventoNorm,
          // explicit boolean (guarantee correct type for n8n IF boolean mode)
          esReservaConfirmada: Boolean(isConfirmada),
          // fallback string in case the IF node compares strings
          esReservaConfirmadaStr: isConfirmada ? 'true' : 'false',
          timestamp: new Date().toISOString(),
          data: payload,
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Webhook respondió con status ${response.status}`);
      } else {
        this.logger.log(`Evento ${evento} emitido a n8n`);
      }
    } catch (error: any) {
      this.logger.warn(`Error emitiendo webhook: ${error.message}`);
    }
  }
}
