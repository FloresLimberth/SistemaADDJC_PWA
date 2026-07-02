import { z } from 'zod';
import { EtapaMesocicloValues } from '@/types/enums';

// Schema para crear mesociclo
// Basado EXACTAMENTE en: backend/src/modules/planificacion/dto/create-mesociclo.dto.ts

export const createMesocicloSchema = z
  .object({
    macrocicloId: z.string().min(1, 'El macrociclo es requerido'),

    nombre: z
      .string()
      .min(3, 'Nombre debe tener al menos 3 caracteres')
      .max(100, 'Nombre no puede exceder 100 caracteres'),

    codigoMesociclo: z.string().min(1, 'Codigo de mesociclo es requerido').max(50, 'Codigo no puede exceder 50 caracteres'),

    etapa: z.enum(EtapaMesocicloValues as [string, ...string[]]),

    fechaInicio: z.string().min(1, 'Fecha de inicio es requerida'),

    fechaFin: z.string().min(1, 'Fecha de fin es requerida'),

    objetivoFisico: z.string().min(1, 'Objetivo fisico es requerido'),

    objetivoTecnico: z.string().min(1, 'Objetivo tecnico es requerido'),

    objetivoTactico: z.string().min(1, 'Objetivo tactico es requerido'),
  })
  .refine((data) => new Date(data.fechaFin) > new Date(data.fechaInicio), {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export type CreateMesocicloInput = z.infer<typeof createMesocicloSchema>;

// Schema para actualizar mesociclo
export const updateMesocicloSchema = z
  .object({
    macrocicloId: z.string().optional(),

    nombre: z
      .string()
      .min(3, 'Nombre debe tener al menos 3 caracteres')
      .max(100, 'Nombre no puede exceder 100 caracteres')
      .optional(),

    codigoMesociclo: z.string().max(50, 'Codigo no puede exceder 50 caracteres').optional(),

    etapa: z.enum(EtapaMesocicloValues as [string, ...string[]]).optional(),

    fechaInicio: z.string().optional(),

    fechaFin: z.string().optional(),

    objetivoFisico: z.string().optional(),

    objetivoTecnico: z.string().optional(),

    objetivoTactico: z.string().optional(),
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

export type UpdateMesocicloInput = z.infer<typeof updateMesocicloSchema>;
