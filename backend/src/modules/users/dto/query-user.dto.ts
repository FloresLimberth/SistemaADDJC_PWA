import { IsString, IsEnum, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RolUsuario } from '@prisma/client';

export class QueryUserDto {
  // Buscar por email (parcial)
  @IsString()
  @IsOptional()
  email?: string;

  // Buscar por nombre completo (parcial)
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  // Filtrar por rol
  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;

  // Filtrar por estado (activo/inactivo)
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  estado?: boolean;

  // Paginación - página actual
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  // Paginación - elementos por página
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
