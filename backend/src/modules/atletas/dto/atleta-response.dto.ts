import { CategoriaPeso } from '@prisma/client';

// DTO para respuestas (incluye datos del usuario asociado)
export interface AtletaResponseDto {
  id: string; // BigInt convertido a string
  usuarioId: string;
  municipio: string;
  club: string;
  categoria: string;
  fechaNacimiento: Date;
  edad: number;
  direccion: string | null;
  telefono: string | null;
  entrenadorAsignadoId: string | null;
  categoriaPeso: CategoriaPeso;
  pesoActual: number | null;
  perfilActual: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Datos del usuario asociado
  usuario: {
    id: string;
    ci: string;
    nombreCompleto: string;
    email: string;
    estado: boolean;
  };

  // Datos del entrenador asignado (opcional)
  entrenadorAsignado?: {
    id: string;
    nombreCompleto: string;
  } | null;
}
