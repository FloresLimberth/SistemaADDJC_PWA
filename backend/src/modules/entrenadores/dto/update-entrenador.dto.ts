import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateEntrenadorDto {
  // Datos del entrenador (todos opcionales en update)
  @IsString()
  @MaxLength(100)
  @IsOptional()
  municipio?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  especialidad?: string;

  // Estado del entrenador (para activar/desactivar)
  // Este campo actualiza el estado del usuario asociado
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
