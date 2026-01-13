import { Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { WebhookEmitterService } from '../common/webhook-emitter.service';
export declare class ReservaService {
    private readonly reservaRepository;
    private readonly webhookEmitter;
    constructor(reservaRepository: Repository<Reserva>, webhookEmitter: WebhookEmitterService);
    create(createReservaDto: CreateReservaDto): Promise<Reserva>;
    validarDisponibilidad(espacioId: string, inicio: Date, fin: Date): Promise<boolean>;
    findAll(): Promise<Reserva[]>;
    findOne(id: string): Promise<Reserva | null>;
}
