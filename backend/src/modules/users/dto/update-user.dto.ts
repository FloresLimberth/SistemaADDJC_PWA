import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class UpdateUserDto {
  // CI del usuario (opcional en actualización)
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @IsOptional()
  ci?: string;

  // Nombre completo del usuario
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  nombreCompleto?: string;

  // Email del usuario
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  email?: string;

  // Contraseña (solo si se quiere cambiar)
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsOptional()
  contrasena?: string;

  // Rol del usuario
  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;

  // Estado del usuario (para soft delete / reactivar)
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
