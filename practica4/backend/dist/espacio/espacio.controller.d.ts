import { EspacioService } from './espacio.service';
import { CreateEspacioDto } from './dto/create-espacio.dto';
import { UpdateEspacioDto } from './dto/update-espacio.dto';
export declare class EspacioController {
    private readonly espacioService;
    constructor(espacioService: EspacioService);
    create(createEspacioDto: CreateEspacioDto): Promise<import("./entities/espacio.entity").Espacio>;
    findAll(): Promise<import("./entities/espacio.entity").Espacio[]>;
    buscar(nombre: string): Promise<import("./entities/espacio.entity").Espacio[]>;
    findOne(id: string): Promise<import("./entities/espacio.entity").Espacio>;
    update(id: string, updateEspacioDto: UpdateEspacioDto): Promise<import("./entities/espacio.entity").Espacio>;
    remove(id: string): Promise<import("./entities/espacio.entity").Espacio>;
}
