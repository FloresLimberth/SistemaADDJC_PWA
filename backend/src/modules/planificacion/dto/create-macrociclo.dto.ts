import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoMacrociclo } from '@prisma/client';

// DTO para crear un Macrociclo
// Nombres de campos coinciden EXACTAMENTE con schema.prisma líneas 268-294
export class CreateMacrocicloDto {
  // nombre - String @db.VarChar(100)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nombre!: string;

  // temporada - String @db.VarChar(50)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  temporada!: string;

  // equipo - String @db.VarChar(100)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  equipo!: string;

  // categoriaObjetivo - String @db.VarChar(50)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  categoriaObjetivo!: string;

  // objetivo1 - String @db.Text
  @IsString()
  @IsNotEmpty()
  objetivo1!: string;

  // objetivo2 - String @db.Text
  @IsString()
  @IsNotEmpty()
  objetivo2!: string;

  // objetivo3 - String @db.Text
  @IsString()
  @IsNotEmpty()
  objetivo3!: string;

  // fechaInicio - DateTime @db.Date
  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  // fechaFin - DateTime @db.Date
  @IsDateString()
  @IsNotEmpty()
  fechaFin!: string;

  // estado - EstadoMacrociclo (ENUM: PLANIFICADO, EN_CURSO, COMPLETADO, CANCELADO)
  @IsEnum(EstadoMacrociclo)
  @IsOptional()
  estado?: EstadoMacrociclo;

  // creadoPor - BigInt (FK a Usuario)
  // Se obtendrá del usuario autenticado, no se envía en el body
}
