import { Repository } from 'typeorm';
import { Espacio } from './entities/espacio.entity';
import { CreateEspacioDto } from './dto/create-espacio.dto';
import { UpdateEspacioDto } from './dto/update-espacio.dto';
export declare class EspacioService {
    private readonly espacioRepository;
    constructor(espacioRepository: Repository<Espacio>);
    create(createEspacioDto: CreateEspacioDto): Promise<Espacio>;
    findAll(): Promise<Espacio[]>;
    findOne(id: string): Promise<Espacio>;
    buscarPorNombre(termino: string): Promise<Espacio[]>;
    update(id: string, updateEspacioDto: UpdateEspacioDto): Promise<Espacio>;
    remove(id: string): Promise<Espacio>;
}
