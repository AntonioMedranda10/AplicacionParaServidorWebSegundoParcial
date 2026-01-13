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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reserva = exports.EstadoReserva = void 0;
const typeorm_1 = require("typeorm");
const espacio_entity_1 = require("../../espacio/entities/espacio.entity");
var EstadoReserva;
(function (EstadoReserva) {
    EstadoReserva["PENDIENTE"] = "PENDIENTE";
    EstadoReserva["CONFIRMADA"] = "CONFIRMADA";
    EstadoReserva["CANCELADA"] = "CANCELADA";
    EstadoReserva["FINALIZADA"] = "FINALIZADA";
})(EstadoReserva || (exports.EstadoReserva = EstadoReserva = {}));
let Reserva = class Reserva {
    id;
    createdAt;
    fechaInicio;
    fechaFin;
    estado;
    espacio;
    espacioId;
    usuarioId;
};
exports.Reserva = Reserva;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Reserva.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Reserva.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Reserva.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Reserva.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: EstadoReserva,
        default: EstadoReserva.PENDIENTE
    }),
    __metadata("design:type", String)
], Reserva.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => espacio_entity_1.Espacio, (espacio) => espacio.id, { nullable: false }),
    __metadata("design:type", espacio_entity_1.Espacio)
], Reserva.prototype, "espacio", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Reserva.prototype, "espacioId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Reserva.prototype, "usuarioId", void 0);
exports.Reserva = Reserva = __decorate([
    (0, typeorm_1.Entity)()
], Reserva);
//# sourceMappingURL=reserva.entity.js.map