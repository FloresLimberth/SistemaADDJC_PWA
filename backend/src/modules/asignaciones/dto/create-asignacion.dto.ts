import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateAsignacionDto {
  @IsNotEmpty({ message: 'El ID del atleta es requerido' })
  @IsString()
  atletaId!: string;

  @IsNotEmpty({ message: 'El ID del microciclo es requerido' })
  @IsString()
  microcicloId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}
