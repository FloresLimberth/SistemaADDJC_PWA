import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAsignacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}
