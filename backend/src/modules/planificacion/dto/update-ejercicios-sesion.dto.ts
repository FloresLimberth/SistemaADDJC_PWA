import {
  IsArray,
  IsString,
  IsOptional,
  ArrayMinSize,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para un ejercicio individual con metadatos opcionales
export class EjercicioSesionItemDto {
  @IsString()
  ejercicioId!: string; // BigInt como string

  @IsInt()
  @Min(1)
  orden!: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  duracionMinutos?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  repeticiones?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  series?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  intensidad?: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

// DTO para actualizar ejercicios de una sesion
// Recibe arrays de IDs de ejercicios del catalogo, validados contra la BD
// El backend regenera automaticamente los campos de texto (contenidoFisico, etc.)
export class UpdateEjerciciosSesionDto {
  // Lista de ejercicios con sus IDs y metadatos
  // El orden se determina por la posicion en el array
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjercicioSesionItemDto)
  @ArrayMinSize(1, { message: 'Debe incluir al menos un ejercicio' })
  ejercicios!: EjercicioSesionItemDto[];
}

// DTO simplificado para actualizar solo con IDs (sin metadatos extra)
// Util cuando solo se quiere cambiar la seleccion de ejercicios
export class UpdateEjerciciosSesionSimpleDto {
  // IDs de ejercicios fisicos del catalogo
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ejerciciosFisicos?: string[];

  // IDs de ejercicios tecnicos (tachi-waza y ne-waza)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ejerciciosTecnicos?: string[];

  // IDs de ejercicios de resistencia
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ejerciciosResistencia?: string[];

  // IDs de ejercicios de velocidad
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ejerciciosVelocidad?: string[];
}
