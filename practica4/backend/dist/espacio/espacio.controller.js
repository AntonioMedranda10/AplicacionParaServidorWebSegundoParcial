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
exports.EspacioController = void 0;
const common_1 = require("@nestjs/common");
const espacio_service_1 = require("./espacio.service");
const create_espacio_dto_1 = require("./dto/create-espacio.dto");
const update_espacio_dto_1 = require("./dto/update-espacio.dto");
let EspacioController = class EspacioController {
    espacioService;
    constructor(espacioService) {
        this.espacioService = espacioService;
    }
    create(createEspacioDto) {
        return this.espacioService.create(createEspacioDto);
    }
    findAll() {
        return this.espacioService.findAll();
    }
    buscar(nombre) {
        return this.espacioService.buscarPorNombre(nombre);
    }
    findOne(id) {
        return this.espacioService.findOne(id);
    }
    update(id, updateEspacioDto) {
        return this.espacioService.update(id, updateEspacioDto);
    }
    remove(id) {
        return this.espacioService.remove(id);
    }
};
exports.EspacioController = EspacioController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_espacio_dto_1.CreateEspacioDto]),
    __metadata("design:returntype", void 0)
], EspacioController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EspacioController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('buscar'),
    __param(0, (0, common_1.Query)('nombre')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EspacioController.prototype, "buscar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EspacioController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_espacio_dto_1.UpdateEspacioDto]),
    __metadata("design:returntype", void 0)
], EspacioController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EspacioController.prototype, "remove", null);
exports.EspacioController = EspacioController = __decorate([
    (0, common_1.Controller)('espacios'),
    __metadata("design:paramtypes", [espacio_service_1.EspacioService])
], EspacioController);
//# sourceMappingURL=espacio.controller.js.map