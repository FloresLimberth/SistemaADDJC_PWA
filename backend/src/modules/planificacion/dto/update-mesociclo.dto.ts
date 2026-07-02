import { PartialType } from '@nestjs/mapped-types';
import { CreateMesocicloDto } from './create-mesociclo.dto';

export class UpdateMesocicloDto extends PartialType(CreateMesocicloDto) {}
