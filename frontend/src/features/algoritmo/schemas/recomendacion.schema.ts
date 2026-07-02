import { z } from 'zod';

// Schema para aprobar recomendacion
// Verificado: backend/src/modules/recomendaciones/dto/aprobar-recomendacion.dto.ts
// comentario: opcional, max 500 chars
export const aprobarRecomendacionSchema = z.object({
  comentario: z
    .string()
    .max(500, 'El comentario no puede exceder 500 caracteres')
    .optional(),
});

export type AprobarRecomendacionForm = z.infer<typeof aprobarRecomendacionSchema>;

// Schema para rechazar recomendacion
// Verificado: backend/src/modules/recomendaciones/dto/rechazar-recomendacion.dto.ts
// motivo: opcional, max 1000 chars
// accionAlternativa: opcional, max 500 chars
export const rechazarRecomendacionSchema = z.object({
  motivo: z
    .string()
    .max(1000, 'El motivo no puede exceder 1000 caracteres')
    .optional(),
  accionAlternativa: z
    .string()
    .max(500, 'La accion alternativa no puede exceder 500 caracteres')
    .optional(),
});

export type RechazarRecomendacionForm = z.infer<typeof rechazarRecomendacionSchema>;

// Schema para modificar recomendacion
// Simplificado: solo justificacion + comentario adicional
export const modificarRecomendacionSchema = z.object({
  modificaciones: z.object({}).passthrough(),
  justificacion: z
    .string()
    .min(1, 'La justificacion es obligatoria')
    .max(1000, 'La justificacion no puede exceder 1000 caracteres'),
  comentarioAdicional: z
    .string()
    .max(500, 'El comentario adicional no puede exceder 500 caracteres')
    .optional(),
});

export type ModificarRecomendacionForm = z.infer<typeof modificarRecomendacionSchema>;
