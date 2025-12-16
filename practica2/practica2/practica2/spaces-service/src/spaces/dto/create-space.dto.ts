import { IsString, IsNumber, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';

export class CreateSpaceDto {
  @IsNotEmpty({ message: 'El nombre del espacio es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  readonly name: string;

  @IsNotEmpty({ message: 'La ubicación es requerida' })
  @IsString({ message: 'La ubicación debe ser un texto' })
  readonly location: string;

  @IsNotEmpty({ message: 'La capacidad es requerida' })
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(1, { message: 'La capacidad debe ser al menos 1' })
  @Max(10000, { message: 'La capacidad no puede exceder 10000' })
  readonly capacity: number;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  readonly description?: string;
}