import { EstadoEspacio } from '../entities/espacio.entity';
export declare class CreateEspacioDto {
    nombre: string;
    capacidad: number;
    tipo: string;
    estado?: EstadoEspacio;
}
