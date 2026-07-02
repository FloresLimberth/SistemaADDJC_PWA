import { z } from 'zod';

// Schema para crear asignacion atleta-microciclo
// Basado EXACTAMENTE en: backend/src/modules/asignaciones/dto/create-asignacion.dto.ts

export const createAsignacionSchema = z.object({
  atletaId: z.string().min(1, 'El ID del atleta es requerido'),

  microcicloId: z.string().min(1, 'El ID del microciclo es requerido'),

  observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional(),
});

export type CreateAsignacionInput = z.infer<typeof createAsignacionSchema>;
