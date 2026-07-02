import { IsString, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryEntrenadorDto {
  // Buscar por nombre completo (parcial)
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  // Buscar por municipio
  @IsString()
  @IsOptional()
  municipio?: string;

  // Buscar por especialidad
  @IsString()
  @IsOptional()
  especialidad?: string;

  // Filtrar por estado del usuario asociado
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  estado?: boolean;

  // Paginacion - pagina actual
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  // Paginacion - elementos por pagina
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
