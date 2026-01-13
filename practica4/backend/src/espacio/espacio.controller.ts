import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EspacioService } from './espacio.service';
import { CreateEspacioDto } from './dto/create-espacio.dto';
import { UpdateEspacioDto } from './dto/update-espacio.dto';

@Controller('espacios')
export class EspacioController {
  constructor(private readonly espacioService: EspacioService) {}

  @Post()
  create(@Body() createEspacioDto: CreateEspacioDto) {
    return this.espacioService.create(createEspacioDto);
  }

  @Get()
  findAll() {
    return this.espacioService.findAll();
  }

  // Endpoint especial para búsqueda (Requisito MCP)
  // Uso: GET /espacios/buscar?nombre=Sala
  @Get('buscar')
  buscar(@Query('nombre') nombre: string) {
    return this.espacioService.buscarPorNombre(nombre);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.espacioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEspacioDto: UpdateEspacioDto) {
    return this.espacioService.update(id, updateEspacioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.espacioService.remove(id);
  }
}