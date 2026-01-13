"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EspacioModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const espacio_service_1 = require("./espacio.service");
const espacio_controller_1 = require("./espacio.controller");
const espacio_entity_1 = require("./entities/espacio.entity");
let EspacioModule = class EspacioModule {
};
exports.EspacioModule = EspacioModule;
exports.EspacioModule = EspacioModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([espacio_entity_1.Espacio])],
        controllers: [espacio_controller_1.EspacioController],
        providers: [espacio_service_1.EspacioService],
        exports: [espacio_service_1.EspacioService]
    })
], EspacioModule);
//# sourceMappingURL=espacio.module.js.map