import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTestFisicoDto } from './create-test-fisico.dto';

// Excluir atletaId y sesionId de las actualizaciones
// Un test fisico no puede cambiar de atleta ni de sesion despues de creado
export class UpdateTestFisicoDto extends PartialType(
  OmitType(CreateTestFisicoDto, ['atletaId', 'sesionId'] as const)
) {}
