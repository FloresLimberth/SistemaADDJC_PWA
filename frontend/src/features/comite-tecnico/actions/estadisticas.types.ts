// ===================================
// TIPOS PARA ESTADISTICAS DE ATLETAS
// ===================================

// Tipos para estadisticas
export interface AtletaEstadisticas {
  atletaId: string;
  tipoTest: string;
  estadisticas: {
    min: number;
    max: number;
    promedio: number;
    desviacion: number;
  };
  tendencia: 'MEJORANDO' | 'ESTANCADO' | 'EMPEORANDO';
  progreso: {
    absoluto: number;
    porcentaje: number;
  } | null;
  historial: {
    id: string;
    fechaTest: string;
    valor: number;
  }[];
}

export interface AtletaEvolucion {
  atleta: {
    id: string;
    nombreCompleto: string;
  };
  tipoTest: string;
  tests: {
    id: string;
    fechaTest: string;
    valor: number;
  }[];
  tendencia: 'MEJORANDO' | 'ESTANCADO' | 'EMPEORANDO';
  mejora: {
    absoluto: number;
    porcentaje: number;
  } | null;
}

// Tipos de tests disponibles
export interface TipoTest {
  value: string;
  label: string;
  unidad: string;
}

export const TIPOS_TEST: TipoTest[] = [
  { value: 'pressBanca', label: 'Press Banca', unidad: 'kg' },
  { value: 'tiron', label: 'Tiron', unidad: 'kg' },
  { value: 'sentadilla', label: 'Sentadilla', unidad: 'kg' },
  { value: 'barraFija', label: 'Barra Fija', unidad: 'reps' },
  { value: 'paralelas', label: 'Paralelas', unidad: 'reps' },
  { value: 'navette', label: 'Navette (VO2max)', unidad: 'palier' },
];
