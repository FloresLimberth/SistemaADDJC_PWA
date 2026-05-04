import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateEntrenadorDto {
  // Datos del usuario (se crea automaticamente con rol ENTRENADOR)
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  ci!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nombreCompleto!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  contrasena!: string;

  // Datos del entrenador
  @IsString()
  @MaxLength(100)
  municipio!: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  especialidad?: string;
}
