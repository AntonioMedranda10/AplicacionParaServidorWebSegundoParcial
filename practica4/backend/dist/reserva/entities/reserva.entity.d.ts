import { Espacio } from '../../espacio/entities/espacio.entity';
export declare enum EstadoReserva {
    PENDIENTE = "PENDIENTE",
    CONFIRMADA = "CONFIRMADA",
    CANCELADA = "CANCELADA",
    FINALIZADA = "FINALIZADA"
}
export declare class Reserva {
    id: string;
    createdAt: Date;
    fechaInicio: Date;
    fechaFin: Date;
    estado: EstadoReserva;
    espacio: Espacio;
    espacioId: string;
    usuarioId: string;
}
