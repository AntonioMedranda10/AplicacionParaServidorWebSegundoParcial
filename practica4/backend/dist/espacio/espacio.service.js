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
exports.EspacioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const espacio_entity_1 = require("./entities/espacio.entity");
let EspacioService = class EspacioService {
    espacioRepository;
    constructor(espacioRepository) {
        this.espacioRepository = espacioRepository;
    }
    async create(createEspacioDto) {
        const espacio = this.espacioRepository.create(createEspacioDto);
        return await this.espacioRepository.save(espacio);
    }
    async findAll() {
        return await this.espacioRepository.find();
    }
    async findOne(id) {
        const espacio = await this.espacioRepository.findOneBy({ id });
        if (!espacio)
            throw new common_1.NotFoundException(`Espacio con ID ${id} no encontrado`);
        return espacio;
    }
    async buscarPorNombre(termino) {
        return await this.espacioRepository.find({
            where: { nombre: (0, typeorm_2.Like)(`%${termino}%`) }
        });
    }
    async update(id, updateEspacioDto) {
        const espacio = await this.espacioRepository.preload({
            id: id,
            ...updateEspacioDto,
        });
        if (!espacio)
            throw new common_1.NotFoundException(`Espacio con ID ${id} no encontrado`);
        return await this.espacioRepository.save(espacio);
    }
    async remove(id) {
        const espacio = await this.findOne(id);
        return await this.espacioRepository.remove(espacio);
    }
};
exports.EspacioService = EspacioService;
exports.EspacioService = EspacioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(espacio_entity_1.Espacio)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EspacioService);
//# sourceMappingURL=espacio.service.js.map