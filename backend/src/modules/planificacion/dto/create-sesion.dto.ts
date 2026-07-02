import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { DiaSemana, TipoSesion, Turno, TipoPlanificacion, CreadoPor } from '@prisma/client';

export class CreateSesionDto {
  @IsString()
  @IsNotEmpty()
  microcicloId!: string; // BigInt como string desde el cliente

  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @IsEnum(DiaSemana)
  @IsNotEmpty()
  diaSemana!: DiaSemana;

  @IsInt()
  @Min(1)
  @Max(7)
  numeroSesion!: number;

  @IsEnum(TipoSesion)
  @IsNotEmpty()
  tipoSesion!: TipoSesion;

  @IsEnum(Turno)
  @IsOptional()
  turno?: Turno; // Default: COMPLETO

  @IsEnum(TipoPlanificacion)
  @IsOptional()
  tipoPlanificacion?: TipoPlanificacion; // Default: INICIAL

  @IsString()
  @IsOptional()
  sesionBaseId?: string; // BigInt como string (para ajustes)

  @IsEnum(CreadoPor)
  @IsOptional()
  creadoPor?: CreadoPor; // Default: COMITE_TECNICO

  // Planificación
  @IsInt()
  @Min(1)
  duracionPlanificada!: number; // En minutos (requerido siempre)

  // Opcionales para COMPETENCIA/DESCANSO
  @IsInt()
  @Min(0)
  @IsOptional()
  volumenPlanificado?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  intensidadPlanificada?: number; // Porcentaje

  // Datos reales (se llenan despues de la sesion - usados por algoritmo de recomendacion)
  @IsInt()
  @Min(0)
  @IsOptional()
  volumenReal?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  intensidadReal?: number;

  // Contenidos (opcionales para COMPETENCIA/DESCANSO)
  @IsString()
  @IsOptional()
  contenidoFisico?: string;

  @IsString()
  @IsOptional()
  contenidoTecnico?: string;

  @IsString()
  @IsOptional()
  contenidoTactico?: string;

  // Estructura de sesión (opcionales)
  @IsString()
  @IsOptional()
  calentamiento?: string;

  @IsString()
  @IsOptional()
  partePrincipal?: string;

  @IsString()
  @IsOptional()
  vueltaCalma?: string;

  // Observaciones
  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  materialNecesario?: string;
}
