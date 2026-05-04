import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateIf,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateDolenciaDto } from './create-dolencia.dto';
import { CreateRendimientoEjercicioDto } from './create-rendimiento-ejercicio.dto';

export class CreateRegistroPostEntrenamientoDto {
  // IDs de relaciones (se convierten a BigInt en el servicio)
  @IsInt({ message: 'El ID del atleta debe ser un numero entero' })
  @Type(() => Number)
  atletaId!: number;

  @IsInt({ message: 'El ID de la sesion debe ser un numero entero' })
  @Type(() => Number)
  sesionId!: number;

  // Asistencia
  @IsBoolean({ message: 'El campo asistio debe ser verdadero o falso' })
  asistio!: boolean;

  @ValidateIf((o) => !o.asistio)
  @IsString({ message: 'El motivo de inasistencia debe ser texto' })
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
  motivoInasistencia?: string;

  // Ejecucion de sesion (porcentajes: 0-100)
  // NOTA: Para sesiones COMPETENCIA estos campos son opcionales (se usan valores por defecto)
  // NOTA: ejerciciosCompletados e intensidadAlcanzada son Decimal(5,2) en BD
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? parseFloat(value) : undefined))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Ejercicios completados debe ser un numero' })
  @Min(0, { message: 'Ejercicios completados no puede ser menor a 0%' })
  @Max(100, { message: 'Ejercicios completados no puede exceder 100%' })
  ejerciciosCompletados?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? parseFloat(value) : undefined))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Intensidad alcanzada debe ser un numero' })
  @Min(0, { message: 'Intensidad alcanzada no puede ser menor a 0%' })
  @Max(100, { message: 'Intensidad alcanzada no puede exceder 100%' })
  intensidadAlcanzada?: number;

  // Duracion real en minutos
  // NOTA: Para sesiones COMPETENCIA es opcional
  @IsOptional()
  @IsInt({ message: 'Duracion real debe ser un numero entero (minutos)' })
  @Min(1, { message: 'La duracion debe ser al menos 1 minuto' })
  @Max(480, { message: 'La duracion no puede exceder 8 horas (480 minutos)' })
  duracionReal?: number;

  // RPE (Rate of Perceived Exertion): 1-10
  // NOTA: Para sesiones COMPETENCIA es opcional
  @IsOptional()
  @IsInt({ message: 'RPE debe ser un numero entero' })
  @Min(1, { message: 'RPE debe ser minimo 1 (esfuerzo muy ligero)' })
  @Max(10, { message: 'RPE debe ser maximo 10 (esfuerzo maximo)' })
  rpe?: number;

  // Calidad de sueno: 1-10
  // NOTA: Para sesiones COMPETENCIA es opcional
  @IsOptional()
  @IsInt({ message: 'Calidad de sueno debe ser un numero entero' })
  @Min(1, { message: 'Calidad de sueno debe ser minimo 1 (muy mala)' })
  @Max(10, { message: 'Calidad de sueno debe ser maximo 10 (excelente)' })
  calidadSueno?: number;

  // Horas de sueno (Decimal 3,1 en BD - ejemplo: 7.5)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber({ maxDecimalPlaces: 1 }, { message: 'Horas de sueno debe ser un numero' })
  @Min(0, { message: 'Horas de sueno no puede ser negativo' })
  @Max(24, { message: 'Horas de sueno no puede exceder 24 horas' })
  horasSueno?: number;

  // Estado animico: 1-10
  // NOTA: Para sesiones COMPETENCIA es opcional
  @IsOptional()
  @IsInt({ message: 'Estado animico debe ser un numero entero' })
  @Min(1, { message: 'Estado animico debe ser minimo 1 (muy mal)' })
  @Max(10, { message: 'Estado animico debe ser maximo 10 (excelente)' })
  estadoAnimico?: number;

  // Dolencias (array de dolencias, opcional)
  @IsOptional()
  @IsArray({ message: 'Dolencias debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateDolenciaDto)
  dolencias?: CreateDolenciaDto[];

  // Observaciones
  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Las observaciones no pueden exceder 1000 caracteres',
  })
  observaciones?: string;

  // Rendimiento por ejercicio (obligatorio cuando asistio=true y sesion no es COMPETENCIA)
  // El backend valida la obligatoriedad segun el contexto de la sesion
  @IsOptional()
  @IsArray({ message: 'Rendimientos de ejercicios debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe registrar al menos 1 rendimiento de ejercicio' })
  @ValidateNested({ each: true })
  @Type(() => CreateRendimientoEjercicioDto)
  rendimientosEjercicios?: CreateRendimientoEjercicioDto[];
}
