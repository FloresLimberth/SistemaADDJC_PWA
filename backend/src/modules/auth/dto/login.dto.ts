import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// DTO para validar los datos de login
export class LoginDto {
  // El email debe ser valido y no estar vacio
  @IsEmail({}, { message: 'El email debe ser valido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  // La contrasena debe tener minimo 6 caracteres
  @IsString({ message: 'La contrasena debe ser texto' })
  @IsNotEmpty({ message: 'La contrasena es requerida' })
  @MinLength(6, { message: 'La contrasena debe tener minimo 6 caracteres' })
  password!: string;
}
