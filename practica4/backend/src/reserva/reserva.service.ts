import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not } from 'typeorm';
import { Reserva, EstadoReserva } from './entities/reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { WebhookEmitterService } from '../common/webhook-emitter.service';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    private readonly webhookEmitter: WebhookEmitterService,
  ) {}

  // 1. LÓGICA DE NEGOCIO: Crear Reserva
  async create(createReservaDto: CreateReservaDto) {
    const { espacioId, fechaInicio, fechaFin, usuarioId } = createReservaDto;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Validación 1: Coherencia temporal
    if (inicio >= fin) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin.');
    }

    // Validación 2: Disponibilidad (Evitar solapamiento)
    const estaOcupado = await this.validarDisponibilidad(espacioId, inicio, fin);
    if (estaOcupado) {
      throw new ConflictException('El espacio ya está reservado en este horario.');
    }

    // Si pasa las validaciones, guardamos
    const reserva = this.reservaRepository.create({
      espacioId,
      usuarioId,
      fechaInicio: inicio,
      fechaFin: fin,
      estado: EstadoReserva.CONFIRMADA, // Confirmamos directamente para este taller
    });

    const saved = await this.reservaRepository.save(reserva);

    // Emitimos evento a n8n (silencioso si no hay URL configurada)
    await this.webhookEmitter.emit('reserva.confirmada', {
      reserva: saved,
      usuarioId,
      espacioId,
    });

    return saved;
  }

  // 2. LÓGICA CRÍTICA PARA EL MCP (Tool de validación)
  // Devuelve true si hay conflicto (está ocupado), false si está libre
  async validarDisponibilidad(espacioId: string, inicio: Date, fin: Date): Promise<boolean> {
    const solapamiento = await this.reservaRepository.findOne({
      where: {
        espacioId: espacioId,
        estado: Not(EstadoReserva.CANCELADA), // Ignoramos las canceladas
        // Lógica de Solapamiento: (InicioA < FinB) Y (FinA > InicioB)
        fechaInicio: LessThan(fin),
        fechaFin: MoreThan(inicio),
      },
    });

    return !!solapamiento; // Retorna true si encontró una reserva que estorba
  }

  async findAll() {
    return await this.reservaRepository.find({ relations: ['espacio'] });
  }

  async findOne(id: string) {
    return await this.reservaRepository.findOne({ 
        where: { id },
        relations: ['espacio'] 
    });
  }
}