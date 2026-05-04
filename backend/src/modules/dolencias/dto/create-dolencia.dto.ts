import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { TipoLesion } from '@prisma/client';

export class CreateDolenciaDto {
  @IsNotEmpty({ message: 'El ID del registro post-entrenamiento es requerido' })
  @IsString()
  registroPostEntrenamientoId!: string;

  @IsNotEmpty({ message: 'La zona afectada es requerida' })
  @IsString()
  @MaxLength(100, { message: 'La zona no puede exceder 100 caracteres' })
  zona!: string;

  @IsNotEmpty({ message: 'El nivel de dolor es requerido' })
  @IsInt({ message: 'El nivel debe ser un numero entero' })
  @Min(1, { message: 'El nivel minimo es 1' })
  @Max(10, { message: 'El nivel maximo es 10' })
  nivel!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripcion no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoLesion, { message: 'Tipo de lesion invalido' })
  tipoLesion?: TipoLesion;
}
