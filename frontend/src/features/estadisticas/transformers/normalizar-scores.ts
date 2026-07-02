// Normalizacion min-max para radar charts de tests fisicos
// Convierte valores absolutos (kg, reps, ml/kg/min) a escala 0-100
// para poder comparar metricas heterogeneas en un radar chart

// Rangos de referencia basados en datos reales de la BD
// y valores tipicos de judo categorias juvenil/senior
const RANGOS_REFERENCIA = {
  pressBanca: { min: 40, max: 150, unidad: 'kg' },
  tiron: { min: 30, max: 120, unidad: 'kg' },
  sentadilla: { min: 50, max: 200, unidad: 'kg' },
  barraFija: { min: 0, max: 25, unidad: 'repeticiones' },
  paralelas: { min: 0, max: 30, unidad: 'repeticiones' },
  vo2max: { min: 30, max: 65, unidad: 'ml/kg/min' },
} as const;

export type MetricaTest = keyof typeof RANGOS_REFERENCIA;

interface ValorNormalizado {
  metrica: string;
  valor: number; // 0-100
  valorReal: number;
  unidad: string;
}

// Nombres legibles para cada metrica
const NOMBRES_METRICAS: Record<MetricaTest, string> = {
  pressBanca: 'Press Banca',
  tiron: 'Tiron',
  sentadilla: 'Sentadilla',
  barraFija: 'Barra Fija',
  paralelas: 'Paralelas',
  vo2max: 'VO2max',
};

// Normaliza un valor individual usando min-max scaling
// Retorna valor entre 0 y 100, clamped para evitar overflow
function normalizarValor(
  valor: number,
  min: number,
  max: number
): number {
  if (max === min) return 50;
  const normalizado = ((valor - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalizado));
}

// Normaliza un conjunto de tests fisicos para radar chart
// Recibe objeto parcial (no todos los tests son obligatorios)
export function normalizarTestsParaRadar(
  tests: Partial<Record<MetricaTest, number>>
): ValorNormalizado[] {
  return Object.entries(tests)
    .filter(
      (entry): entry is [MetricaTest, number] =>
        entry[0] in RANGOS_REFERENCIA && typeof entry[1] === 'number'
    )
    .map(([metrica, valorReal]) => {
      const rango = RANGOS_REFERENCIA[metrica];
      return {
        metrica: NOMBRES_METRICAS[metrica],
        valor: Math.round(normalizarValor(valorReal, rango.min, rango.max)),
        valorReal,
        unidad: rango.unidad,
      };
    });
}

// Exportar rangos para uso en tooltips informativos
export { RANGOS_REFERENCIA, NOMBRES_METRICAS };
