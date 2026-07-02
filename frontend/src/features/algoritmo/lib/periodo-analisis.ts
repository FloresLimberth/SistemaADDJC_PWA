// Constantes y helpers puros del período de análisis
// Módulo neutro (sin 'use client' ni 'use server') para que tanto Server Components
// como Client Components puedan importar el helper de parseo

export const PERIODOS_ANALISIS = [
  { valor: '30', etiqueta: 'Últimos 30 días' },
  { valor: '90', etiqueta: 'Últimos 90 días' },
  { valor: '180', etiqueta: 'Últimos 180 días' },
  { valor: '365', etiqueta: 'Último año' },
] as const;

export const PERIODO_DEFAULT = '90';

// Valida un valor de días contra los permitidos
// Si viene de searchParams puede ser cualquier cosa, hay que sanear
export function parsearPeriodo(raw: string | undefined | null): number {
  if (!raw) return Number(PERIODO_DEFAULT);
  const valido = PERIODOS_ANALISIS.find((p) => p.valor === raw);
  return valido ? Number(valido.valor) : Number(PERIODO_DEFAULT);
}
