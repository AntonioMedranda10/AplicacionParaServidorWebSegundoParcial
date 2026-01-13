import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
export declare class ReservaController {
    private readonly reservaService;
    constructor(reservaService: ReservaService);
    create(createReservaDto: CreateReservaDto): Promise<import("./entities/reserva.entity").Reserva>;
    findAll(): Promise<import("./entities/reserva.entity").Reserva[]>;
    checkAvailability(espacioId: string, inicio: string, fin: string): Promise<{
        disponible: boolean;
    }>;
    findOne(id: string): Promise<import("./entities/reserva.entity").Reserva | null>;
}
