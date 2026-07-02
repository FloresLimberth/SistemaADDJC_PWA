import {
  IsString,
  IsEmail,
  IsInt,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CategoriaPeso } from '@prisma/client';

export class CreateAtletaDto {
  // Datos del usuario (se crea automaticamente con rol ATLETA)
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  ci!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nombreCompleto!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  contrasena!: string;

  // Datos del atleta
  @IsString()
  @MaxLength(100)
  municipio!: string;

  // Datos deportivos: municipio del club y club
  @IsString()
  @MinLength(1, { message: 'Municipio del club es requerido' })
  @MaxLength(100)
  municipioClub!: string;

  @IsString()
  @MinLength(1, { message: 'Club es requerido' })
  @MaxLength(100)
  club!: string;

  @IsString()
  @MinLength(1, { message: 'Categoria es requerida' })
  @MaxLength(50)
  categoria!: string;

  @IsDateString()
  fechaNacimiento!: string;

  @IsInt()
  @Min(5)
  edad!: number;

  // Campos opcionales
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

  @IsEnum(CategoriaPeso, { message: 'Categoria de peso es requerida y debe ser un valor valido' })
  categoriaPeso!: CategoriaPeso;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Peso actual debe ser un numero con maximo 2 decimales' }
  )
  @Min(0, { message: 'Peso actual no puede ser negativo' })
  @IsOptional()
  pesoActual?: number;
}
