import { PartialType } from '@nestjs/mapped-types';
import { CreateEspacioDto } from './create-espacio.dto';

export class UpdateEspacioDto extends PartialType(CreateEspacioDto) {}