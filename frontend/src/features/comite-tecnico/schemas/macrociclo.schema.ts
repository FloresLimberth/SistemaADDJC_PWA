import { z } from 'zod';
import { EstadoMacrocicloValues } from '@/types/enums';

// Schema para crear macrociclo
// Basado EXACTAMENTE en: backend/src/modules/planificacion/dto/create-macrociclo.dto.ts

export const createMacrocicloSchema = z
  .object({
    nombre: z
      .string()
      .min(3, 'Nombre debe tener al menos 3 caracteres')
      .max(100, 'Nombre no puede exceder 100 caracteres'),

    temporada: z.string().max(50, 'Temporada no puede exceder 50 caracteres'),

    equipo: z.string().max(100, 'Equipo no puede exceder 100 caracteres'),

    categoriaObjetivo: z.string().max(50, 'Categoria objetivo no puede exceder 50 caracteres'),

    objetivo1: z.string().min(1, 'Objetivo 1 es requerido'),

    objetivo2: z.string().min(1, 'Objetivo 2 es requerido'),

    objetivo3: z.string().min(1, 'Objetivo 3 es requerido'),

    fechaInicio: z.string().min(1, 'Fecha de inicio es requerida'),

    fechaFin: z.string().min(1, 'Fecha de fin es requerida'),

    estado: z.enum(EstadoMacrocicloValues as [string, ...string[]]).optional(),
  })
  .refine((data) => new Date(data.fechaFin) > new Date(data.fechaInicio), {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export type CreateMacrocicloInput = z.infer<typeof createMacrocicloSchema>;

// Schema para actualizar macrociclo
export const updateMacrocicloSchema = z
  .object({
    nombre: z
      .string()
      .min(3, 'Nombre debe tener al menos 3 caracteres')
      .max(100, 'Nombre no puede exceder 100 caracteres')
      .optional(),

    temporada: z.string().max(50).optional(),

    equipo: z.string().max(100).optional(),

    categoriaObjetivo: z.string().max(50).optional(),

    objetivo1: z.string().optional(),

    objetivo2: z.string().optional(),

    objetivo3: z.string().optional(),

    fechaInicio: z.string().optional(),

    fechaFin: z.string().optional(),

    estado: z.enum(EstadoMacrocicloValues as [string, ...string[]]).optional(),
  })
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin) {
        return new Date(data.fechaFin) > new Date(data.fechaInicio);
      }
      return true;
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path: ['fechaFin'],
    }
  );

export type UpdateMacrocicloInput = z.infer<typeof updateMacrocicloSchema>;
