// DTO para rechazar una recomendacion del algoritmo
// El COMITE_TECNICO debe proporcionar una razon para el rechazo
// El algoritmo usara esta informacion para mejorar futuras recomendaciones

import { IsString, MaxLength, IsOptional } from 'class-validator';

export class RechazarRecomendacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  motivo?: string;

  // Opcionalmente el COMITE puede indicar que hara manualmente
  @IsOptional()
  @IsString()
  @MaxLength(500)
  accionAlternativa?: string;
}
