import { z } from 'zod';

// Estadisticas del dashboard del comite tecnico
// Basado en los modelos de backend verificados en schema.prisma

export interface ComiteTecnicoDashboardStats {
  totalAtletas: number;
  totalEntrenadores: number;
  macrociclosActivos: number;
  microciclosEnCurso: number;
  testsEsteMes: number;
  recomendacionesPendientes: number;
  dolenciasActivas: number;
}

// Schema para validar respuesta del dashboard
export const comiteTecnicoDashboardStatsSchema = z.object({
  totalAtletas: z.number().int().nonnegative(),
  totalEntrenadores: z.number().int().nonnegative(),
  macrociclosActivos: z.number().int().nonnegative(),
  microciclosEnCurso: z.number().int().nonnegative(),
  testsEsteMes: z.number().int().nonnegative(),
  recomendacionesPendientes: z.number().int().nonnegative(),
  dolenciasActivas: z.number().int().nonnegative(),
});
