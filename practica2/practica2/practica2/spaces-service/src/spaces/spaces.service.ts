import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Space } from './entities/space.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly repo: Repository<Space>,
  ) {}

  async create(createSpaceDto: CreateSpaceDto): Promise<Space> {
    this.validateSpaceData(createSpaceDto);
    const space = this.repo.create({
      name: createSpaceDto.name,
      location: createSpaceDto.location || '',
      capacity: createSpaceDto.capacity,
      description: createSpaceDto.description || '',
      isActive: true,
    });
    return this.repo.save(space);
  }

  async findAll(): Promise<Space[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Space> {
    const space = await this.repo.findOne({ where: { id } });
    if (!space) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }
    return space;
  }

  async update(id: number, updateSpaceDto: UpdateSpaceDto): Promise<Space> {
    const space = await this.findOne(id);
    this.validateSpaceData({ ...space, ...updateSpaceDto });

    const merged = this.repo.merge(space, {
      name: updateSpaceDto.name ?? space.name,
      location: updateSpaceDto.location ?? space.location,
      capacity: updateSpaceDto.capacity ?? space.capacity,
      description: updateSpaceDto.description ?? space.description,
      isActive: updateSpaceDto.isActive ?? space.isActive,
    });

    return this.repo.save(merged);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }
  }

  async applyReservation(payload: any): Promise<void> {
    if (!payload) {
      throw new BadRequestException('Payload de reservación requerido');
    }

    const spaceId = this.extractSpaceId(payload);
    if (!spaceId) {
      throw new BadRequestException('ID de espacio (espacioId o spaceId) requerido en el payload');
    }

    const space = await this.findOne(spaceId);

    if (!this.isValidCapacity(space.capacity)) {
      throw new BadRequestException('Capacidad inválida para el espacio');
    }

    if (space.capacity <= 0) {
      throw new BadRequestException(`Espacio ${spaceId} sin capacidad disponible`);
    }

    await this.repo.update(spaceId, { capacity: space.capacity - 1 });
  }

  private validateSpaceData(data: any): void {
    if (!data.name || data.name.toString().trim().length === 0) {
      throw new BadRequestException('El nombre del espacio es requerido');
    }

    if (data.capacity !== undefined && !this.isValidCapacity(Number(data.capacity))) {
      throw new BadRequestException('La capacidad debe ser un número positivo');
    }
  }

  private extractSpaceId(payload: any): number | undefined {
    const id = payload?.espacioId ?? payload?.spaceId;
    return id ? Number(id) : undefined;
  }

  private isValidCapacity(capacity: any): boolean {
    return typeof capacity === 'number' && capacity >= 0 && Number.isInteger(capacity);
  }
}