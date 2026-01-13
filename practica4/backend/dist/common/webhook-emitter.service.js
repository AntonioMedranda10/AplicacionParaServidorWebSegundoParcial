"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookEmitterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEmitterService = void 0;
const common_1 = require("@nestjs/common");
let WebhookEmitterService = WebhookEmitterService_1 = class WebhookEmitterService {
    logger = new common_1.Logger(WebhookEmitterService_1.name);
    n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    async emit(evento, payload) {
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
                    esReservaConfirmada: Boolean(isConfirmada),
                    esReservaConfirmadaStr: isConfirmada ? 'true' : 'false',
                    timestamp: new Date().toISOString(),
                    data: payload,
                }),
            });
            if (!response.ok) {
                this.logger.warn(`Webhook respondió con status ${response.status}`);
            }
            else {
                this.logger.log(`Evento ${evento} emitido a n8n`);
            }
        }
        catch (error) {
            this.logger.warn(`Error emitiendo webhook: ${error.message}`);
        }
    }
};
exports.WebhookEmitterService = WebhookEmitterService;
exports.WebhookEmitterService = WebhookEmitterService = WebhookEmitterService_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookEmitterService);
//# sourceMappingURL=webhook-emitter.service.js.map