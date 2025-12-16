import { Controller, Get, Post, Body, Param, Put, Delete, Logger } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Space } from './entities/space.entity';
import { IdempotencyService } from '../idempotency/idempotency.service';

@Controller('spaces')
export class SpacesController {
  private readonly logger = new Logger(SpacesController.name);

  constructor(
    private readonly spacesService: SpacesService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  @Post()
  async create(@Body() createSpaceDto: CreateSpaceDto): Promise<Space> {
    this.logger.log(`Creando espacio: ${createSpaceDto.name}`);
    return this.spacesService.create(createSpaceDto);
  }

  @Get()
  async findAll(): Promise<Space[]> {
    this.logger.log('Obteniendo todos los espacios');
    return this.spacesService.findAll();
  }

  @Get('metrics')
  getMetrics(): any {
    this.logger.log('Obteniendo métricas de idempotencia');
    return this.idempotencyService.getMetrics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Space> {
    const spaceId = parseInt(id, 10);
    if (isNaN(spaceId)) {
      throw new Error('ID inválido');
    }
    this.logger.log(`Obteniendo espacio con ID: ${spaceId}`);
    return this.spacesService.findOne(spaceId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ): Promise<Space> {
    const spaceId = parseInt(id, 10);
    if (isNaN(spaceId)) {
      throw new Error('ID inválido');
    }
    this.logger.log(`Actualizando espacio con ID: ${spaceId}`);
    return this.spacesService.update(spaceId, updateSpaceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    const spaceId = parseInt(id, 10);
    if (isNaN(spaceId)) {
      throw new Error('ID inválido');
    }
    this.logger.log(`Eliminando espacio con ID: ${spaceId}`);
    await this.spacesService.remove(spaceId);
    return { message: `Espacio ${spaceId} eliminado correctamente` };
  }
}