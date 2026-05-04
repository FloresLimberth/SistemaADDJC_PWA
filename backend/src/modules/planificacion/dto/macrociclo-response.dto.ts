import { EstadoMacrociclo } from '@prisma/client';

// DTO de respuesta para Macrociclo
// Estructura que se envía al cliente
// BigInt y Decimal se convierten automaticamente por BigIntTransformInterceptor
export interface MacrocicloResponseDto {
  id: bigint;
  nombre: string;
  temporada: string;
  equipo: string;
  categoriaObjetivo: string;
  objetivo1: string;
  objetivo2: string;
  objetivo3: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoMacrociclo;
  creadoPor: bigint;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones opcionales (si se incluyen)
  creador?: {
    id: bigint;
    nombreCompleto: string;
    email: string;
  };
}
