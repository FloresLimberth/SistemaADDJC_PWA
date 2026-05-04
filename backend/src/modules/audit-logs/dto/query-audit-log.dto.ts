import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryAuditLogDto {
  @IsOptional()
  @IsNumberString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  recurso?: string;

  @IsOptional()
  @IsString()
  accion?: string;

  @IsOptional()
  @IsString()
  desde?: string;

  @IsOptional()
  @IsString()
  hasta?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
