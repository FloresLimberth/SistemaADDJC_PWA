import { z } from 'zod';
import { TipoEjercicioValues } from '@/types/enums';

// Schema para filtros del catalogo de ejercicios
// Verificado: catalogo-ejercicios.controller.ts - query params
export const filtrosCatalogoSchema = z.object({
  tipo: z.enum(TipoEjercicioValues as [string, ...string[]]).optional(),
  activo: z.boolean().optional(),
  search: z.string().optional(),
});

export type FiltrosCatalogo = z.infer<typeof filtrosCatalogoSchema>;
