// DTO para registrar rendimiento de un ejercicio individual
// Parte del sistema de recomendaciones personalizadas
// Basado en: docs/algoritmo_10_especificacion_funcional.md RF-002

import { IsBoolean, IsInt, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRendimientoEjercicioDto {
  // ID del ejercicio en la sesion (FK a ejercicios_sesion)
  @IsInt({ message: 'El ID del ejercicio de sesion debe ser un numero entero' })
  @Type(() => Number)
  ejercicioSesionId!: number;

  // Si el ejercicio fue completado
  @IsBoolean({ message: 'El campo completado debe ser verdadero o falso' })
  completado!: boolean;

  // Calificacion del rendimiento (1-10)
  @IsOptional()
  @IsInt({ message: 'Rendimiento debe ser un numero entero' })
  @Min(1, { message: 'Rendimiento debe ser minimo 1' })
  @Max(10, { message: 'Rendimiento debe ser maximo 10' })
  rendimiento?: number;

  // Dificultad percibida por el atleta (1-10)
  @IsOptional()
  @IsInt({ message: 'Dificultad percibida debe ser un numero entero' })
  @Min(1, { message: 'Dificultad percibida debe ser minimo 1' })
  @Max(10, { message: 'Dificultad percibida debe ser maximo 10' })
  dificultadPercibida?: number;

  // Tiempo real dedicado al ejercicio (minutos)
  @IsOptional()
  @IsInt({ message: 'Tiempo real debe ser un numero entero (minutos)' })
  @Min(1, { message: 'Tiempo real debe ser al menos 1 minuto' })
  @Max(120, { message: 'Tiempo real no puede exceder 120 minutos' })
  tiempoReal?: number;

  // Observacion del entrenador sobre este ejercicio
  @IsOptional()
  @IsString({ message: 'Observacion debe ser texto' })
  @MaxLength(500, { message: 'Observacion no puede exceder 500 caracteres' })
  observacion?: string;

  // Motivo si no se completo el ejercicio
  @IsOptional()
  @IsString({ message: 'Motivo no completado debe ser texto' })
  @MaxLength(500, { message: 'Motivo no puede exceder 500 caracteres' })
  motivoNoCompletado?: string;
}
