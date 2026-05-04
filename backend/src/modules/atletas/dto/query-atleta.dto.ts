import { IsString, IsEnum, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoriaPeso } from '@prisma/client';

export class QueryAtletaDto {
  // Buscar por nombre completo (parcial)
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  // Buscar por club
  @IsString()
  @IsOptional()
  club?: string;

  // Buscar por categoria
  @IsString()
  @IsOptional()
  categoria?: string;

  // Filtrar por categoria de peso
  @IsEnum(CategoriaPeso)
  @IsOptional()
  categoriaPeso?: CategoriaPeso;

  // Filtrar por entrenador asignado
  @IsString()
  @IsOptional()
  entrenadorAsignadoId?: string;

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
