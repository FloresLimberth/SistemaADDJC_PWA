// DTO para modificar una recomendacion del algoritmo antes de aplicarla
// Simplificado: solo justificacion + comentario adicional

import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsObject,
} from 'class-validator';

// Modificaciones se guardan como JSON de auditoria (sin campos especificos)
export class ModificacionesDto {}

export class ModificarRecomendacionDto {
  @IsNotEmpty({ message: 'Las modificaciones son requeridas' })
  @IsObject()
  modificaciones!: ModificacionesDto;

  @IsNotEmpty({ message: 'La justificacion de modificacion es requerida' })
  @IsString()
  @MaxLength(1000)
  justificacion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentarioAdicional?: string;
}
