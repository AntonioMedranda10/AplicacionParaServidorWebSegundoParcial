import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

  @Get()
  findAll() {
    return this.reservaService.findAll();
  }

  // Endpoint Útil para MCP: Verificar disponibilidad sin reservar
  // Uso: GET /reservas/disponibilidad?espacioId=...&inicio=...&fin=...
  @Get('disponibilidad')
  async checkAvailability(
    @Query('espacioId') espacioId: string,
    @Query('inicio') inicio: string,
    @Query('fin') fin: string,
  ) {
    const isOccupied = await this.reservaService.validarDisponibilidad(
      espacioId, 
      new Date(inicio), 
      new Date(fin)
    );
    return { disponible: !isOccupied };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservaService.findOne(id);
  }
}