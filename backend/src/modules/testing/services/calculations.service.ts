import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculationsService {
  // ===== VO2MAX CALCULATIONS =====

  // Formula: VO2max = 30 + (palier × 2)
  // Fuente: docs/analisis_excel_11-12-13.md linea 389
  calculateVO2maxNavette(palier: number): number {
    if (!palier || palier <= 0) return 0;
    return 30 + palier * 2;
  }

  // Clasificar VO2max segun rendimiento
  // Fuente: docs/analisis_excel_11-12-13.md lineas 562-566
  classifyVO2max(vo2max: number): string {
    if (vo2max >= 60) return 'Alto rendimiento';
    if (vo2max >= 45) return 'Intermedio';
    return 'Principiante';
  }

  // Obtener objetivo VO2max recomendado segun genero
  getVO2maxTarget(genero?: 'MASCULINO' | 'FEMENINO'): number {
    // Fuente: docs/definicion_roles_permisos.md linea 339
    return genero === 'FEMENINO' ? 53 : 60;
  }

  // ===== 1RM INTENSITY CALCULATIONS =====

  // Calcular intensidad como % del 1RM anterior
  // Fuente: docs/analisis_excel_11-12-13.md lineas 541-544
  // Si el peso actual supera al anterior, es un nuevo record personal (PR)
  // En ese caso, el nuevo peso se convierte en el nuevo 1RM y la intensidad es 100%
  calculate1RMIntensity(pesoActual: number, pesoAnterior: number): number | null {
    if (!pesoAnterior || pesoAnterior <= 0) return null;
    if (!pesoActual || pesoActual <= 0) return null;

    const intensidad = (pesoActual / pesoAnterior) * 100;

    // Si supera el 1RM anterior, es nuevo record personal = 100%
    // El nuevo valor se convierte en el nuevo 1RM de referencia
    if (intensidad > 100) {
      return 100;
    }

    return intensidad;
  }

  // Detectar si un peso es un nuevo record personal
  // Retorna true si el peso actual supera al anterior
  esNuevoRecord(pesoActual: number, pesoAnterior: number): boolean {
    if (!pesoAnterior || pesoAnterior <= 0) return false;
    if (!pesoActual || pesoActual <= 0) return false;

    return pesoActual > pesoAnterior;
  }

  // ===== IMPROVEMENT CALCULATIONS =====

  // Calcular mejora entre dos valores
  calculateImprovement(
    valorActual: number,
    valorAnterior: number
  ): { absoluto: number; porcentaje: number } | null {
    if (
      valorAnterior === null ||
      valorAnterior === undefined ||
      valorActual === null ||
      valorActual === undefined
    ) {
      return null;
    }

    const absoluto = valorActual - valorAnterior;
    const porcentaje = valorAnterior !== 0 ? (absoluto / valorAnterior) * 100 : 0;

    return {
      absoluto: Number(absoluto.toFixed(2)),
      porcentaje: Number(porcentaje.toFixed(2)),
    };
  }

  // Determinar tendencia basada en ultimos N tests
  calculateTrend(valores: number[]): 'MEJORANDO' | 'ESTANCADO' | 'EMPEORANDO' {
    if (valores.length < 2) return 'ESTANCADO';

    const ultimosTres = valores.slice(-3);
    if (ultimosTres.length < 2) return 'ESTANCADO';

    const mejoras = [];
    for (let i = 1; i < ultimosTres.length; i++) {
      mejoras.push(ultimosTres[i] - ultimosTres[i - 1]);
    }

    const promedioDiferencia = mejoras.reduce((a, b) => a + b, 0) / mejoras.length;

    // Si mejora mas de 1% en promedio → MEJORANDO
    if (promedioDiferencia > 0.5) return 'MEJORANDO';
    // Si empeora mas de 1% en promedio → EMPEORANDO
    if (promedioDiferencia < -0.5) return 'EMPEORANDO';
    // Estable
    return 'ESTANCADO';
  }

  // ===== STATISTICS CALCULATIONS =====

  // Calcular estadisticas basicas
  // Fuente: docs/analisis_excel_11-12-13.md lineas 581-596
  calculateStatistics(valores: number[]): {
    maxima: number;
    media: number;
    minima: number;
    ultima: number;
    total: number;
  } | null {
    if (!valores || valores.length === 0) return null;

    const valoresValidos = valores.filter((v) => v !== null && v !== undefined);
    if (valoresValidos.length === 0) return null;

    const maxima = Math.max(...valoresValidos);
    const minima = Math.min(...valoresValidos);
    const suma = valoresValidos.reduce((a, b) => a + b, 0);
    const media = suma / valoresValidos.length;
    const ultima = valoresValidos[valoresValidos.length - 1];

    return {
      maxima: Number(maxima.toFixed(2)),
      media: Number(media.toFixed(2)),
      minima: Number(minima.toFixed(2)),
      ultima: Number(ultima.toFixed(2)),
      total: valoresValidos.length,
    };
  }

  // ===== TIME CONVERSIONS =====

  // Convertir tiempo en formato "MM:SS" o "HH:MM:SS" a segundos
  parseTimeToSeconds(time: string): number | null {
    if (!time) return null;

    const parts = time.split(':').map((p) => parseInt(p, 10));

    if (parts.length === 2) {
      // MM:SS
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      // HH:MM:SS
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    }

    return null;
  }

  // Convertir segundos a formato "MM:SS"
  formatSecondsToTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
