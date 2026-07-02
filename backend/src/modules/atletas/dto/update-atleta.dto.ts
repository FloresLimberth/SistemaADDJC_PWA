import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CategoriaPeso } from '@prisma/client';

export class UpdateAtletaDto {
  // Datos del atleta (todos opcionales en update)
  @IsString()
  @MaxLength(100)
  @IsOptional()
  municipio?: string;

  // Datos deportivos: municipio del club y club
  @IsString()
  @MinLength(1, { message: 'Municipio del club es requerido' })
  @MaxLength(100)
  @IsOptional()
  municipioClub?: string;

  @IsString()
  @MinLength(1, { message: 'Club es requerido' })
  @MaxLength(100)
  @IsOptional()
  club?: string;

  @IsString()
  @MinLength(1, { message: 'Categoria es requerida' })
  @MaxLength(50)
  @IsOptional()
  categoria?: string;

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  @IsInt()
  @Min(5)
  @IsOptional()
  edad?: number;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  entrenadorAsignadoId?: string; // BigInt convertido a string

  @IsEnum(CategoriaPeso, { message: 'Categoria de peso debe ser un valor valido' })
  @IsOptional()
  categoriaPeso?: CategoriaPeso;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Peso actual debe ser un numero con maximo 2 decimales' }
  )
  @Min(0, { message: 'Peso actual no puede ser negativo' })
  @IsOptional()
  pesoActual?: number;

  // Estado del atleta (para activar/desactivar)
  // Este campo actualiza el estado del usuario asociado
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
