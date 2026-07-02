import { z } from 'zod';

// Schema para crear entrenador
// Basado en: backend/src/modules/entrenadores/dto/create-entrenador.dto.ts

export const createEntrenadorSchema = z.object({
  // Datos del usuario (se crea automaticamente con rol ENTRENADOR)
  ci: z
    .string()
    .min(5, 'CI debe tener al menos 5 caracteres')
    .max(20, 'CI no puede exceder 20 caracteres'),

  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(255, 'Nombre no puede exceder 255 caracteres'),

  email: z
    .string()
    .email('Email invalido')
    .max(255, 'Email no puede exceder 255 caracteres'),

  contrasena: z
    .string()
    .min(8, 'Contrasena debe tener al menos 8 caracteres')
    .max(100, 'Contrasena no puede exceder 100 caracteres'),

  // Datos del entrenador
  municipio: z
    .string()
    .min(1, 'Municipio es requerido')
    .max(100, 'Municipio no puede exceder 100 caracteres'),

  especialidad: z
    .string()
    .max(100, 'Especialidad no puede exceder 100 caracteres')
    .optional(),
});

export type CreateEntrenadorInput = z.infer<typeof createEntrenadorSchema>;

// Schema para actualizar entrenador
// Basado en: backend/src/modules/entrenadores/dto/update-entrenador.dto.ts
export const updateEntrenadorSchema = z.object({
  // Campos obligatorios
  municipio: z
    .string()
    .min(1, 'Municipio es requerido')
    .max(100, 'Municipio no puede exceder 100 caracteres'),

  // Campos opcionales
  especialidad: z
    .string()
    .max(100, 'Especialidad no puede exceder 100 caracteres')
    .optional(),

  // Estado del usuario asociado (para activar/desactivar)
  estado: z.boolean().optional(),
});

export type UpdateEntrenadorInput = z.infer<typeof updateEntrenadorSchema>;
