// DTO para aprobar una recomendacion del algoritmo
// El COMITE_TECNICO usa este DTO para dar su aprobacion

import { IsString, IsOptional, MaxLength } from 'class-validator';

export class AprobarRecomendacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}
