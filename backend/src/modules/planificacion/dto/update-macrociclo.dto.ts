import { PartialType } from '@nestjs/mapped-types';
import { CreateMacrocicloDto } from './create-macrociclo.dto';

// DTO para actualizar un Macrociclo
// Hace todos los campos opcionales usando PartialType
export class UpdateMacrocicloDto extends PartialType(CreateMacrocicloDto) {}
