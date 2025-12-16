import { IsString, IsNumber, IsNotEmpty, Min, Max, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSpaceDto {
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre del espacio no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(1, { message: 'La capacidad debe ser al menos 1' })
  @Max(10000, { message: 'La capacidad no puede exceder 10000' })
  capacity?: number;

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser un texto' })
  location?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}