import { RolUsuario } from '@prisma/client';

// DTO para respuestas (NO incluye la contraseña)
// BigInt se convierte automaticamente a string por BigIntTransformInterceptor
export interface UserResponseDto {
  id: bigint;
  ci: string;
  nombreCompleto: string;
  email: string;
  rol: RolUsuario;
  estado: boolean;
  fechaRegistro: Date;
  ultimoAcceso: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
