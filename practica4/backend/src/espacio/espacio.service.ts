import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Espacio } from './entities/espacio.entity';
import { CreateEspacioDto } from './dto/create-espacio.dto';
import { UpdateEspacioDto } from './dto/update-espacio.dto';

@Injectable()
export class EspacioService {
  constructor(
    @InjectRepository(Espacio)
    private readonly espacioRepository: Repository<Espacio>,
  ) {}

  async create(createEspacioDto: CreateEspacioDto) {
    const espacio = this.espacioRepository.create(createEspacioDto);
    return await this.espacioRepository.save(espacio);
  }

  async findAll() {
    return await this.espacioRepository.find();
  }

  async findOne(id: string) {
    const espacio = await this.espacioRepository.findOneBy({ id });
    if (!espacio) throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    return espacio;
  }

  // --- LÓGICA CLAVE PARA EL TOOL DE MCP ---
  // Permite buscar "Sala" y encontrar "Sala de Juntas"
  async buscarPorNombre(termino: string) {
    return await this.espacioRepository.find({
      where: { nombre: Like(`%${termino}%`) }
    });
  }

  async update(id: string, updateEspacioDto: UpdateEspacioDto) {
    const espacio = await this.espacioRepository.preload({
      id: id,
      ...updateEspacioDto,
    });
    if (!espacio) throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    return await this.espacioRepository.save(espacio);
  }

  async remove(id: string) {
    const espacio = await this.findOne(id);
    return await this.espacioRepository.remove(espacio);
  }
}