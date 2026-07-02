import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoMicrociclo, CreadoPor, SentidoCarga } from '@prisma/client';

export class CreateMicrocicloDto {
  // Atleta obligatorio - el algoritmo genera sesiones personalizadas
  @IsString()
  @IsNotEmpty({ message: 'El atletaId es obligatorio para generar sesiones personalizadas' })
  atletaId!: string;

  @IsString()
  @IsOptional()
  mesocicloId?: string; // BigInt como string (opcional en v1.0)

  @IsString()
  @IsNotEmpty({ message: 'El codigo de microciclo es obligatorio' })
  codigoMicrociclo!: string; // Codigo identificador del microciclo

  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin!: string;

  @IsEnum(TipoMicrociclo)
  @IsNotEmpty()
  tipoMicrociclo!: TipoMicrociclo;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Volumen total debe ser un numero' })
  @Min(0)
  volumenTotal!: number;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Intensidad promedio debe ser un numero' })
  @Min(0)
  @Max(100)
  intensidadPromedio!: number;

  @IsString()
  @IsNotEmpty()
  objetivoSemanal!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsEnum(CreadoPor)
  @IsOptional()
  creadoPor?: CreadoPor; // Default: COMITE_TECNICO

  // Campos de carga (opcionales - calculados automáticamente)
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Media volumen debe ser un numero' })
  @IsOptional()
  mediaVolumen?: number;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Media intensidad debe ser un numero' })
  @IsOptional()
  mediaIntensidad?: number;

  @IsEnum(SentidoCarga)
  @IsOptional()
  sentidoVolumen?: SentidoCarga;

  @IsEnum(SentidoCarga)
  @IsOptional()
  sentidoIntensidad?: SentidoCarga;
}
