import { IsString, IsNotEmpty, IsDateString, IsUUID } from 'class-validator';

export class CreateReservaDto {
  @IsUUID()
  @IsNotEmpty()
  espacioId: string;

  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  // IsDateString valida formato ISO 8601 (ej: "2025-10-20T10:00:00Z")
  @IsDateString() 
  fechaInicio: string; 

  @IsDateString()
  fechaFin: string;
}