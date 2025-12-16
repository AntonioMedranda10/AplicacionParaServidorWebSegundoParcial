import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IdempotencyKey } from './entities/idempotency.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyRepo: Repository<IdempotencyKey>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createReservationDto: CreateReservationDto, idempotencyKey?: string): Promise<Reservation> {
    // If idempotencyKey provided, check if processed
    if (idempotencyKey) {
      const existing = await this.idempotencyRepo.findOne({ where: { key: idempotencyKey } });
      if (existing) {
        return this.reservationRepo.findOne({ where: { id: existing.reservationId } } as any);
      }
    }

    return await this.dataSource.transaction(async manager => {
      const reservationRepo = manager.getRepository(Reservation);
      const idempotencyRepo = manager.getRepository(IdempotencyKey);

      const spaceIdNum = Number((createReservationDto as any).spaceId);
      const userIdNum = Number((createReservationDto as any).userId || 0);
      const start = new Date((createReservationDto as any).startDate);
      const end = new Date((createReservationDto as any).endDate);

      if (Number.isNaN(spaceIdNum) || Number.isNaN(userIdNum)) {
        throw new BadRequestException('spaceId and userId must be numeric');
      }
      if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) {
        throw new BadRequestException('startDate and endDate must be valid dates');
      }

      const resEntity = reservationRepo.create({
        spaceId: spaceIdNum,
        userId: userIdNum,
        startDate: start,
        endDate: end,
        isActive: true,
      });

      const saved = await reservationRepo.save(resEntity);

      if (idempotencyKey) {
        const rec = idempotencyRepo.create({ key: idempotencyKey, reservationId: saved.id });
        await idempotencyRepo.save(rec);
      }

      return saved;
    });
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepo.find();
  }

  async findOne(id: number): Promise<Reservation> {
    return this.reservationRepo.findOne(id as any);
  }

  async remove(id: number): Promise<void> {
    await this.reservationRepo.delete(id as any);
  }
}