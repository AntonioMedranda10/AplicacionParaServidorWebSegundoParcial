import { IsString, IsInt, Min, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { EstadoEspacio } from '../entities/espacio.entity';

export class CreateEspacioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @Min(1, { message: 'La capacidad debe ser al menos de 1 persona' })
  capacidad: number;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsOptional()
  @IsEnum(EstadoEspacio)
  estado?: EstadoEspacio; // Es opcional, si no se envía será DISPONIBLE
}