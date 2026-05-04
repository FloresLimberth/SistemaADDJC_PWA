import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MarcarRecuperadoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Las notas de recuperacion no pueden exceder 500 caracteres',
  })
  notasRecuperacion?: string;
}
