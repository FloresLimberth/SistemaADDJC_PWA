import { IsString, IsInt, Min, Max, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { TipoLesion } from '@prisma/client';

export class CreateDolenciaDto {
  // Zona afectada (VARCHAR 100 en BD)
  @IsString({ message: 'La zona afectada debe ser texto' })
  @MaxLength(100, { message: 'La zona no puede exceder 100 caracteres' })
  zona!: string;

  // Nivel de dolor: 1-10
  @IsInt({ message: 'El nivel de dolor debe ser un numero entero' })
  @Min(1, { message: 'El nivel de dolor debe ser minimo 1 (molestia leve)' })
  @Max(10, {
    message: 'El nivel de dolor debe ser maximo 10 (dolor insoportable)',
  })
  nivel!: number;

  // Descripcion de la dolencia (opcional)
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La descripcion no puede exceder 500 caracteres',
  })
  descripcion?: string;

  // Tipo de lesion (enum MOLESTIA, DOLOR_AGUDO, LESION_CRONICA, OTRO)
  @IsOptional()
  @IsEnum(TipoLesion, {
    message:
      'Tipo de lesion invalido. Valores permitidos: MOLESTIA, DOLOR_AGUDO, LESION_CRONICA, OTRO',
  })
  tipoLesion?: TipoLesion;
}
