import { z } from 'zod';

// Schema para marcar una dolencia como recuperada
// Basado en: backend/src/modules/dolencias/dto/marcar-recuperado.dto.ts
// Nota: dolenciaId se usa en el frontend para identificar la dolencia,
// pero se envia como parametro de URL al backend (PATCH /dolencias/:id/marcar-recuperado)
export const marcarRecuperadoSchema = z.object({
  dolenciaId: z.coerce.number().int().positive('El ID de la dolencia debe ser positivo'),

  notasRecuperacion: z.string().max(500, 'Las notas de recuperacion no pueden exceder 500 caracteres').optional(),
});

export type MarcarRecuperadoInput = z.infer<typeof marcarRecuperadoSchema>;

// Tipo para el body que se envia al backend (sin dolenciaId, ya que va en la URL)
export type MarcarRecuperadoPayload = {
  notasRecuperacion?: string;
};
