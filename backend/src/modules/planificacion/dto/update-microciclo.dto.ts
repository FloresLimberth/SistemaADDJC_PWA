import { PartialType } from '@nestjs/mapped-types';
import { CreateMicrocicloDto } from './create-microciclo.dto';

export class UpdateMicrocicloDto extends PartialType(CreateMicrocicloDto) {}
