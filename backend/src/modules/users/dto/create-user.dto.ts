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

export class CreateUserDto {
  // CI del usuario (obligatorio, único)
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  ci!: string;

  // Nombre completo del usuario
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nombreCompleto!: string;

  // Email del usuario (obligatorio, único)
  @IsEmail()
  @MaxLength(255)
  email!: string;

  // Contraseña (será hasheada antes de guardar)
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  contrasena!: string;

  // Rol del usuario (enum)
  @IsEnum(RolUsuario)
  rol!: RolUsuario;

  // Estado del usuario (opcional, default true)
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
