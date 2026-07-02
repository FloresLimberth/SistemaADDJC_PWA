// Utilidades para validacion de peso vs categoria de peso
// Los rangos corresponden a las categorias oficiales de judo

import type { CategoriaPeso } from '@/types/enums';

// Rangos de peso por categoria (min exclusivo, max inclusivo)
// Ejemplo: MENOS_66K acepta pesos desde 60.01kg hasta 66.00kg
export const RANGOS_CATEGORIA_PESO: Record<CategoriaPeso, { min: number; max: number }> = {
  MENOS_60K: { min: 0, max: 60 },
  MENOS_66K: { min: 60, max: 66 },
  MENOS_73K: { min: 66, max: 73 },
  MENOS_81K: { min: 73, max: 81 },
  MENOS_90K: { min: 81, max: 90 },
  MENOS_100K: { min: 90, max: 100 },
  MAS_100K: { min: 100, max: 200 },
};

// Nombres legibles para cada categoria
export const NOMBRES_CATEGORIA_PESO: Record<CategoriaPeso, string> = {
  MENOS_60K: 'Menos de 60kg',
  MENOS_66K: 'Menos de 66kg',
  MENOS_73K: 'Menos de 73kg',
  MENOS_81K: 'Menos de 81kg',
  MENOS_90K: 'Menos de 90kg',
  MENOS_100K: 'Menos de 100kg',
  MAS_100K: 'Mas de 100kg',
};

// Obtiene el rango de una categoria como texto legible
export function getRangoTexto(categoria: CategoriaPeso): string {
  const rango = RANGOS_CATEGORIA_PESO[categoria];
  if (!rango) return '';

  if (categoria === 'MENOS_60K') {
    return `hasta ${rango.max}kg`;
  }
  if (categoria === 'MAS_100K') {
    return `desde ${rango.min}kg`;
  }
  return `${rango.min} - ${rango.max}kg`;
}

// Verifica si un peso esta dentro del rango de una categoria
export function pesoEnRango(peso: number, categoria: CategoriaPeso): boolean {
  const rango = RANGOS_CATEGORIA_PESO[categoria];
  if (!rango) return true;

  // Para MENOS_60K, el minimo es 0 (inclusivo)
  if (categoria === 'MENOS_60K') {
    return peso > 0 && peso <= rango.max;
  }

  // Para MAS_100K, no hay maximo practico
  if (categoria === 'MAS_100K') {
    return peso > rango.min;
  }

  // Para el resto, min es exclusivo y max es inclusivo
  return peso > rango.min && peso <= rango.max;
}

// Sugiere la categoria correcta para un peso dado
export function sugerirCategoria(peso: number): CategoriaPeso | null {
  if (peso <= 0) return null;

  if (peso <= 60) return 'MENOS_60K';
  if (peso <= 66) return 'MENOS_66K';
  if (peso <= 73) return 'MENOS_73K';
  if (peso <= 81) return 'MENOS_81K';
  if (peso <= 90) return 'MENOS_90K';
  if (peso <= 100) return 'MENOS_100K';
  return 'MAS_100K';
}

// Resultado de la validacion de peso
export interface ResultadoValidacionPeso {
  valido: boolean;
  mensaje: string | null;
  categoriaSugerida: CategoriaPeso | null;
  categoriaSugeridaNombre: string | null;
}

// Valida el peso contra la categoria seleccionada
export function validarPesoCategoria(
  peso: number | null | undefined,
  categoria: CategoriaPeso | null | undefined
): ResultadoValidacionPeso {
  // Si no hay peso o categoria, no hay nada que validar
  if (!peso || !categoria) {
    return {
      valido: true,
      mensaje: null,
      categoriaSugerida: null,
      categoriaSugeridaNombre: null,
    };
  }

  // Si el peso esta en rango, todo bien
  if (pesoEnRango(peso, categoria)) {
    return {
      valido: true,
      mensaje: null,
      categoriaSugerida: null,
      categoriaSugeridaNombre: null,
    };
  }

  // El peso no corresponde a la categoria
  const categoriaSugerida = sugerirCategoria(peso);
  const rangoActual = getRangoTexto(categoria);
  const nombreActual = NOMBRES_CATEGORIA_PESO[categoria];

  let mensaje = `El peso ingresado (${peso}kg) no corresponde a la categoria "${nombreActual}" (${rangoActual}).`;

  if (categoriaSugerida) {
    const nombreSugerido = NOMBRES_CATEGORIA_PESO[categoriaSugerida];
    mensaje += ` La categoria sugerida es "${nombreSugerido}".`;
  }

  return {
    valido: false,
    mensaje,
    categoriaSugerida,
    categoriaSugeridaNombre: categoriaSugerida ? NOMBRES_CATEGORIA_PESO[categoriaSugerida] : null,
  };
}
