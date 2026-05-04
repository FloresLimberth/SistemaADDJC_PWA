// Calculador de ACWR (Acute:Chronic Workload Ratio)
// Fuente: https://www.scienceforsport.com/acutechronic-workload-ratio/
// Recomendado por IOC (Comite Olimpico Internacional) para prevencion de lesiones

// Zonas de riesgo segun ACWR
export const ZONAS_ACWR = {
  SUBCARGA: { min: 0, max: 0.8, riesgo: 'Desentrenamiento' },
  OPTIMO: { min: 0.8, max: 1.3, riesgo: 'Ninguno' },
  PELIGRO: { min: 1.3, max: 1.5, riesgo: 'Moderado' },
  ALTO_RIESGO: { min: 1.5, max: 999, riesgo: 'Alto' },
} as const;

export type ZonaACWR = keyof typeof ZONAS_ACWR;

export interface CargaSesion {
  duracionMinutos: number;
  rpe: number;
  fecha: Date;
}

export interface ResultadoACWR {
  acwr: number;
  zona: ZonaACWR;
  cargaAguda: number;
  cargaCronica: number;
  riesgoLesion: string;
  recomendacion: string;
}

// Calcula la carga de una sesion usando Session-RPE
// Carga = Duracion (minutos) x RPE
export function calcularCargaSesion(duracionMinutos: number, rpe: number): number {
  return duracionMinutos * rpe;
}

// Calcula la carga aguda (ultimos 7 dias)
export function calcularCargaAguda(sesiones: CargaSesion[]): number {
  const hoy = new Date();
  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  const sesionesUltimaSemana = sesiones.filter((s) => s.fecha >= hace7Dias && s.fecha <= hoy);

  return sesionesUltimaSemana.reduce(
    (total, s) => total + calcularCargaSesion(s.duracionMinutos, s.rpe),
    0
  );
}

// Calcula la carga cronica (promedio de las ultimas 4 semanas)
export function calcularCargaCronica(sesiones: CargaSesion[]): number {
  const hoy = new Date();
  const hace28Dias = new Date(hoy);
  hace28Dias.setDate(hace28Dias.getDate() - 28);

  const sesionesUltimas4Semanas = sesiones.filter((s) => s.fecha >= hace28Dias && s.fecha <= hoy);

  if (sesionesUltimas4Semanas.length === 0) {
    return 0;
  }

  // Agrupar por semana y calcular promedio
  const cargasPorSemana: number[] = [0, 0, 0, 0];

  sesionesUltimas4Semanas.forEach((s) => {
    const diasDesdeHoy = Math.floor((hoy.getTime() - s.fecha.getTime()) / (1000 * 60 * 60 * 24));
    const semana = Math.min(Math.floor(diasDesdeHoy / 7), 3);
    cargasPorSemana[semana] += calcularCargaSesion(s.duracionMinutos, s.rpe);
  });

  // Promedio de las semanas con datos
  const semanasConDatos = cargasPorSemana.filter((c) => c > 0).length;
  if (semanasConDatos === 0) return 0;

  const totalCarga = cargasPorSemana.reduce((a, b) => a + b, 0);
  return totalCarga / semanasConDatos;
}

// Clasifica el ACWR en una zona de riesgo
export function clasificarACWR(acwr: number): ZonaACWR {
  if (acwr >= ZONAS_ACWR.ALTO_RIESGO.min) return 'ALTO_RIESGO';
  if (acwr >= ZONAS_ACWR.PELIGRO.min) return 'PELIGRO';
  if (acwr >= ZONAS_ACWR.OPTIMO.min) return 'OPTIMO';
  return 'SUBCARGA';
}

// Genera recomendacion segun la zona de ACWR
function generarRecomendacion(zona: ZonaACWR): string {
  switch (zona) {
    case 'SUBCARGA':
      return 'Aumentar carga de entrenamiento gradualmente (max 10% semanal)';
    case 'OPTIMO':
      return 'Mantener carga actual, el atleta esta en zona segura';
    case 'PELIGRO':
      return 'Monitorear de cerca, considerar reducir intensidad';
    case 'ALTO_RIESGO':
      return 'Reducir carga inmediatamente, alto riesgo de lesion';
  }
}

// Funcion principal que calcula el ACWR completo
export function calcularACWR(sesiones: CargaSesion[]): ResultadoACWR {
  const cargaAguda = calcularCargaAguda(sesiones);
  const cargaCronica = calcularCargaCronica(sesiones);

  // Evitar division por cero
  const acwr = cargaCronica > 0 ? cargaAguda / cargaCronica : 0;
  const acwrRedondeado = Math.round(acwr * 100) / 100;

  const zona = clasificarACWR(acwrRedondeado);
  const riesgoLesion = ZONAS_ACWR[zona].riesgo;
  const recomendacion = generarRecomendacion(zona);

  return {
    acwr: acwrRedondeado,
    zona,
    cargaAguda,
    cargaCronica: Math.round(cargaCronica),
    riesgoLesion,
    recomendacion,
  };
}

// Calcula ACWR desde registros de post-entrenamiento
// Esta funcion usa los nombres de campos del schema de Prisma
export function calcularACWRDesdeRegistros(
  registros: Array<{
    duracionReal: number;
    rpe: number;
    fechaRegistro: Date;
  }>
): ResultadoACWR {
  const sesiones: CargaSesion[] = registros.map((r) => ({
    duracionMinutos: r.duracionReal,
    rpe: r.rpe,
    fecha: new Date(r.fechaRegistro),
  }));

  return calcularACWR(sesiones);
}
