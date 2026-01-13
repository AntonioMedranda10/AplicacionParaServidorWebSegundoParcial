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
exports.Espacio = exports.EstadoEspacio = void 0;
const typeorm_1 = require("typeorm");
var EstadoEspacio;
(function (EstadoEspacio) {
    EstadoEspacio["DISPONIBLE"] = "DISPONIBLE";
    EstadoEspacio["MANTENIMIENTO"] = "MANTENIMIENTO";
    EstadoEspacio["CLAUSURADO"] = "CLAUSURADO";
})(EstadoEspacio || (exports.EstadoEspacio = EstadoEspacio = {}));
let Espacio = class Espacio {
    id;
    nombre;
    capacidad;
    tipo;
    estado;
};
exports.Espacio = Espacio;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Espacio.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Espacio.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Espacio.prototype, "capacidad", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Espacio.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: EstadoEspacio,
        default: EstadoEspacio.DISPONIBLE
    }),
    __metadata("design:type", String)
], Espacio.prototype, "estado", void 0);
exports.Espacio = Espacio = __decorate([
    (0, typeorm_1.Entity)()
], Espacio);
//# sourceMappingURL=espacio.entity.js.map