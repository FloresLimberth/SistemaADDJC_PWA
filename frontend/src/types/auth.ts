// Tipos para autenticacion
// IMPORTANTE: Deben coincidir con los tipos del backend

// Roles disponibles en el sistema
export type RolUsuario =
  | 'ADMINISTRADOR'
  | 'COMITE_TECNICO'
  | 'ENTRENADOR'
  | 'ATLETA';

// Usuario autenticado
export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  rol: RolUsuario;
}

// Respuesta del backend al hacer login
export interface LoginResponse {
  access_token: string;
  user: Usuario;
}

// Payload del JWT (lo que contiene el token decodificado)
export interface JWTPayload {
  sub: string; // ID del usuario
  email: string;
  rol: RolUsuario;
  iat: number; // Issued at
  exp: number; // Expiration
}

// Estado de autenticacion
export interface AuthState {
  user: Usuario | null;
  isLoading: boolean;
  error: string | null;
}
