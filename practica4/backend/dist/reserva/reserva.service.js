"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reserva_entity_1 = require("./entities/reserva.entity");
const webhook_emitter_service_1 = require("../common/webhook-emitter.service");
let ReservaService = class ReservaService {
    reservaRepository;
    webhookEmitter;
    constructor(reservaRepository, webhookEmitter) {
        this.reservaRepository = reservaRepository;
        this.webhookEmitter = webhookEmitter;
    }
    async create(createReservaDto) {
        const { espacioId, fechaInicio, fechaFin, usuarioId } = createReservaDto;
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        if (inicio >= fin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin.');
        }
        const estaOcupado = await this.validarDisponibilidad(espacioId, inicio, fin);
        if (estaOcupado) {
            throw new common_1.ConflictException('El espacio ya está reservado en este horario.');
        }
        const reserva = this.reservaRepository.create({
            espacioId,
            usuarioId,
            fechaInicio: inicio,
            fechaFin: fin,
            estado: reserva_entity_1.EstadoReserva.CONFIRMADA,
        });
        const saved = await this.reservaRepository.save(reserva);
        await this.webhookEmitter.emit('reserva.confirmada', {
            reserva: saved,
            usuarioId,
            espacioId,
        });
        return saved;
    }
    async validarDisponibilidad(espacioId, inicio, fin) {
        const solapamiento = await this.reservaRepository.findOne({
            where: {
                espacioId: espacioId,
                estado: (0, typeorm_2.Not)(reserva_entity_1.EstadoReserva.CANCELADA),
                fechaInicio: (0, typeorm_2.LessThan)(fin),
                fechaFin: (0, typeorm_2.MoreThan)(inicio),
            },
        });
        return !!solapamiento;
    }
    async findAll() {
        return await this.reservaRepository.find({ relations: ['espacio'] });
    }
    async findOne(id) {
        return await this.reservaRepository.findOne({
            where: { id },
            relations: ['espacio']
        });
    }
};
exports.ReservaService = ReservaService;
exports.ReservaService = ReservaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reserva_entity_1.Reserva)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        webhook_emitter_service_1.WebhookEmitterService])
], ReservaService);
//# sourceMappingURL=reserva.service.js.map