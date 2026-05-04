// Servicio generador de sesiones personalizadas
// Genera sesiones segun perfil del atleta y tipo de microciclo
// Basado en: docs/algoritmo_03_diseno.md

import {
  DiaSemana,
  TipoSesion,
  Turno,
  TipoPlanificacion,
  CreadoPor,
  TipoMicrociclo,
  PerfilAtleta,
} from '@prisma/client';
import { ResultadoPerfil } from './perfil-atleta.service';

// Plantilla base de una sesion
export interface PlantillaSesion {
  diaSemana: DiaSemana;
  numeroSesion: number;
  tipoSesion: TipoSesion;
  turno: Turno;
  duracionPlanificada: number;
  volumenPlanificado: number;
  intensidadPlanificada: number;
  contenidoFisico: string;
  contenidoTecnico: string;
  contenidoTactico: string;
  calentamiento: string;
  partePrincipal: string;
  vueltaCalma: string;
  observaciones: string;
}

// Sesion generada lista para guardar
export interface SesionGenerada {
  fecha: Date;
  diaSemana: DiaSemana;
  numeroSesion: number;
  tipoSesion: TipoSesion;
  turno: Turno;
  tipoPlanificacion: TipoPlanificacion;
  creadoPor: CreadoPor;
  duracionPlanificada: number;
  volumenPlanificado: number;
  intensidadPlanificada: number;
  contenidoFisico: string;
  contenidoTecnico: string;
  contenidoTactico: string;
  calentamiento: string;
  partePrincipal: string;
  vueltaCalma: string;
  observaciones: string;
  aprobado: boolean;
  perfilUtilizado: string;
  justificacionAlgoritmo: string;
}

// Datos de entrada para generar sesiones
export interface DatosGeneracionSesiones {
  tipoMicrociclo: TipoMicrociclo;
  fechaInicio: Date;
  fechaFin: Date;
  objetivoSemanal: string;
  perfilAtleta: ResultadoPerfil;
}

// Resultado de la generacion
export interface ResultadoGeneracion {
  sesiones: SesionGenerada[];
  perfilUtilizado: PerfilAtleta;
  justificacionGeneral: string;
  ajustesAplicados: string[];
}

// Dias de la semana en orden
const DIAS_SEMANA: DiaSemana[] = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
];

// Patrones base segun tipo de microciclo
const PATRONES_MICROCICLO: Record<TipoMicrociclo, Partial<PlantillaSesion>[]> = {
  CARGA: [
    {
      diaSemana: 'LUNES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 120,
      volumenPlanificado: 80,
      intensidadPlanificada: 75,
    },
    {
      diaSemana: 'MARTES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 90,
      volumenPlanificado: 70,
      intensidadPlanificada: 80,
    },
    {
      diaSemana: 'MIERCOLES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 120,
      volumenPlanificado: 85,
      intensidadPlanificada: 70,
    },
    {
      diaSemana: 'JUEVES',
      tipoSesion: 'RECUPERACION',
      duracionPlanificada: 60,
      volumenPlanificado: 40,
      intensidadPlanificada: 50,
    },
    {
      diaSemana: 'VIERNES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 120,
      volumenPlanificado: 90,
      intensidadPlanificada: 85,
    },
    {
      diaSemana: 'SABADO',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 90,
      volumenPlanificado: 75,
      intensidadPlanificada: 80,
    },
    {
      diaSemana: 'DOMINGO',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
  ],
  DESCARGA: [
    {
      diaSemana: 'LUNES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 90,
      volumenPlanificado: 60,
      intensidadPlanificada: 60,
    },
    {
      diaSemana: 'MARTES',
      tipoSesion: 'RECUPERACION',
      duracionPlanificada: 60,
      volumenPlanificado: 40,
      intensidadPlanificada: 50,
    },
    {
      diaSemana: 'MIERCOLES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 90,
      volumenPlanificado: 55,
      intensidadPlanificada: 65,
    },
    {
      diaSemana: 'JUEVES',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
    {
      diaSemana: 'VIERNES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 75,
      volumenPlanificado: 50,
      intensidadPlanificada: 60,
    },
    {
      diaSemana: 'SABADO',
      tipoSesion: 'RECUPERACION',
      duracionPlanificada: 45,
      volumenPlanificado: 30,
      intensidadPlanificada: 40,
    },
    {
      diaSemana: 'DOMINGO',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
  ],
  CHOQUE: [
    {
      diaSemana: 'LUNES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 120,
      volumenPlanificado: 90,
      intensidadPlanificada: 85,
    },
    {
      diaSemana: 'MARTES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 120,
      volumenPlanificado: 95,
      intensidadPlanificada: 90,
    },
    {
      diaSemana: 'MIERCOLES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 90,
      volumenPlanificado: 85,
      intensidadPlanificada: 85,
    },
    {
      diaSemana: 'JUEVES',
      tipoSesion: 'RECUPERACION',
      duracionPlanificada: 60,
      volumenPlanificado: 40,
      intensidadPlanificada: 50,
    },
    {
      diaSemana: 'VIERNES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 120,
      volumenPlanificado: 95,
      intensidadPlanificada: 90,
    },
    {
      diaSemana: 'SABADO',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 90,
      volumenPlanificado: 80,
      intensidadPlanificada: 85,
    },
    {
      diaSemana: 'DOMINGO',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
  ],
  RECUPERACION: [
    {
      diaSemana: 'LUNES',
      tipoSesion: 'RECUPERACION',
      duracionPlanificada: 60,
      volumenPlanificado: 40,
      intensidadPlanificada: 40,
    },
    {
      diaSemana: 'MARTES',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
    {
      diaSemana: 'MIERCOLES',
      tipoSesion: 'RECUPERACION',
      duracionPlanificada: 60,
      volumenPlanificado: 45,
      intensidadPlanificada: 45,
    },
    {
      diaSemana: 'JUEVES',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
    {
      diaSemana: 'VIERNES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 75,
      volumenPlanificado: 50,
      intensidadPlanificada: 55,
    },
    {
      diaSemana: 'SABADO',
      tipoSesion: 'RECUPERACION',
      duracionPlanificada: 45,
      volumenPlanificado: 35,
      intensidadPlanificada: 40,
    },
    {
      diaSemana: 'DOMINGO',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
  ],
  COMPETITIVO: [
    {
      diaSemana: 'LUNES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 90,
      volumenPlanificado: 70,
      intensidadPlanificada: 75,
    },
    {
      diaSemana: 'MARTES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 75,
      volumenPlanificado: 60,
      intensidadPlanificada: 70,
    },
    {
      diaSemana: 'MIERCOLES',
      tipoSesion: 'RECUPERACION',
      duracionPlanificada: 45,
      volumenPlanificado: 30,
      intensidadPlanificada: 40,
    },
    {
      diaSemana: 'JUEVES',
      tipoSesion: 'ENTRENAMIENTO',
      duracionPlanificada: 60,
      volumenPlanificado: 50,
      intensidadPlanificada: 65,
    },
    {
      diaSemana: 'VIERNES',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
    {
      diaSemana: 'SABADO',
      tipoSesion: 'COMPETENCIA',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 100,
    },
    {
      diaSemana: 'DOMINGO',
      tipoSesion: 'DESCANSO',
      duracionPlanificada: 0,
      volumenPlanificado: 0,
      intensidadPlanificada: 0,
    },
  ],
};

// Contenidos por perfil de atleta
const CONTENIDOS_POR_PERFIL: Record<
  PerfilAtleta,
  {
    fisico: string[];
    tecnico: string[];
    tactico: string[];
  }
> = {
  VELOZ: {
    fisico: [
      'Trabajo de potencia y explosividad',
      'Pliometria y saltos',
      'Sprints cortos (10-30m)',
      'Circuitos de fuerza explosiva',
    ],
    tecnico: [
      'Uchi-mata con entrada rapida',
      'Seoi-nage explosivo',
      'Transiciones tachi-ne waza rapidas',
      'Encadenamientos cortos (2-3 tecnicas)',
    ],
    tactico: [
      'Dominar primeros 30 segundos',
      'Buscar ippon temprano',
      'Ataques directos sin preparacion',
      'Defensa ante contra-ataques',
    ],
  },
  RESISTENTE: {
    fisico: [
      'Trabajo aerobico continuo',
      'Circuitos de fuerza resistencia',
      'Intervalos largos (2-3 min)',
      'Core y estabilidad',
    ],
    tecnico: [
      'Kumikata prolongado y variado',
      'Contra-tecnicas (kaeshi-waza)',
      'Ne-waza extensivo',
      'Encadenamientos largos (4-5 tecnicas)',
    ],
    tactico: [
      'Desgastar al oponente',
      'Control de ritmo del combate',
      'Buscar ventaja en golden score',
      'Defensa solida y paciencia',
    ],
  },
  EQUILIBRADO: {
    fisico: [
      'Trabajo mixto fuerza-resistencia',
      'Intervalos variados',
      'Circuitos combinados',
      'Flexibilidad y movilidad',
    ],
    tecnico: [
      'Variedad de ataques',
      'Combinaciones mixtas tachi-ne',
      'Trabajo de ambos lados',
      'Adaptabilidad tecnica',
    ],
    tactico: [
      'Lectura del oponente',
      'Adaptacion durante el combate',
      'Cambio de ritmo',
      'Aprovechamiento de oportunidades',
    ],
  },
  NUEVO: {
    fisico: [
      'Acondicionamiento fisico general',
      'Desarrollo de base aerobica',
      'Fuerza general con pesos libres',
      'Flexibilidad basica',
    ],
    tecnico: [
      'Ukemi (caidas)',
      'Tecnicas basicas de pie',
      'Tecnicas basicas de suelo',
      'Kuzushi y Tsukuri',
    ],
    tactico: [
      'Comprension de reglas',
      'Postura basica (shizen-hontai)',
      'Control de distancia',
      'Defensa basica',
    ],
  },
};

// Genera contenido segun perfil y tipo de sesion
function generarContenido(
  perfil: PerfilAtleta,
  tipoSesion: TipoSesion,
  numeroDia: number
): { fisico: string; tecnico: string; tactico: string } {
  if (tipoSesion === 'DESCANSO' || tipoSesion === 'COMPETENCIA') {
    return { fisico: '', tecnico: '', tactico: '' };
  }

  const contenidos = CONTENIDOS_POR_PERFIL[perfil];
  const index = numeroDia % contenidos.fisico.length;

  if (tipoSesion === 'RECUPERACION') {
    return {
      fisico: 'Recuperacion activa: estiramientos, movilidad articular, foam roller',
      tecnico: 'Repaso tecnico suave, uchi-komi lento',
      tactico: 'Video analisis y revision tactica',
    };
  }

  return {
    fisico: contenidos.fisico[index],
    tecnico: contenidos.tecnico[index],
    tactico: contenidos.tactico[index],
  };
}

// Genera calentamiento estandar
function generarCalentamiento(tipoSesion: TipoSesion): string {
  if (tipoSesion === 'DESCANSO') return '';
  if (tipoSesion === 'COMPETENCIA')
    return 'Calentamiento pre-competencia: activacion neuromuscular, ukemi, uchi-komi';
  if (tipoSesion === 'RECUPERACION') return 'Movilidad articular suave, 10 min trote ligero';
  return 'Trote 10 min, movilidad articular, juegos de activacion, ukemi progresivo';
}

// Genera parte principal
function generarPartePrincipal(
  perfil: PerfilAtleta,
  tipoSesion: TipoSesion,
  contenido: { fisico: string; tecnico: string; tactico: string }
): string {
  if (tipoSesion === 'DESCANSO') return '';
  if (tipoSesion === 'COMPETENCIA') return 'Competencia oficial';

  const partes: string[] = [];
  if (contenido.fisico) partes.push(`FISICO: ${contenido.fisico}`);
  if (contenido.tecnico) partes.push(`TECNICO: ${contenido.tecnico}`);
  if (contenido.tactico) partes.push(`TACTICO: ${contenido.tactico}`);

  return partes.join(' | ');
}

// Genera vuelta a la calma
function generarVueltaCalma(tipoSesion: TipoSesion): string {
  if (tipoSesion === 'DESCANSO') return '';
  if (tipoSesion === 'COMPETENCIA') return 'Enfriamiento post-competencia, hidratacion, revision';
  return 'Estiramientos estaticos 10 min, respiracion, hidratacion';
}

// Aplica ajustes segun perfil del atleta
function aplicarAjustesPerfil(
  plantilla: Partial<PlantillaSesion>,
  perfil: ResultadoPerfil
): { volumen: number; intensidad: number; duracion: number } {
  const volumenBase = plantilla.volumenPlanificado ?? 70;
  const intensidadBase = plantilla.intensidadPlanificada ?? 70;
  const duracionBase = plantilla.duracionPlanificada ?? 90;

  // Aplicar ajustes del perfil
  const factorVolumen = 1 + perfil.ajustes.volumen / 100;
  const factorIntensidad = 1 + perfil.ajustes.intensidad / 100;

  return {
    volumen: Math.round(volumenBase * factorVolumen),
    intensidad: Math.round(intensidadBase * factorIntensidad),
    duracion: duracionBase,
  };
}

// Calcula la fecha para un dia de la semana a partir de fechaInicio
// IMPORTANTE: Usar metodos UTC para evitar bug de timezone.
// Prisma devuelve campos DATE como UTC midnight. Los metodos locales
// (getDay/getDate/setDate) convierten a hora local y en zonas horarias
// negativas (ej: Bolivia UTC-4) devuelven el dia anterior.
// Ref: https://github.com/prisma/prisma/issues/7490
function calcularFechaDia(fechaInicio: Date, diaSemana: DiaSemana): Date {
  const fecha = new Date(fechaInicio);
  const diaObjetivo = DIAS_SEMANA.indexOf(diaSemana);
  // Convertir getUTCDay (0=Dom,1=Lun,...,6=Sab) a indice DIAS_SEMANA (0=Lun,...,6=Dom)
  const diaActual = fecha.getUTCDay() === 0 ? 6 : fecha.getUTCDay() - 1;
  let diferencia = diaObjetivo - diaActual;
  // Si la diferencia es negativa, el dia objetivo ya paso esta semana.
  // Avanzar a la semana siguiente para mantener la fecha dentro del rango.
  if (diferencia < 0) {
    diferencia += 7;
  }
  fecha.setUTCDate(fecha.getUTCDate() + diferencia);
  return fecha;
}

// Funcion principal: genera sesiones personalizadas
export function generarSesiones(datos: DatosGeneracionSesiones): ResultadoGeneracion {
  const patron = PATRONES_MICROCICLO[datos.tipoMicrociclo];
  const perfil = datos.perfilAtleta;
  const ajustesAplicados: string[] = [];

  // Registrar ajustes aplicados
  if (perfil.ajustes.volumen !== 0) {
    ajustesAplicados.push(
      `Volumen ${perfil.ajustes.volumen > 0 ? '+' : ''}${perfil.ajustes.volumen}%`
    );
  }
  if (perfil.ajustes.intensidad !== 0) {
    ajustesAplicados.push(
      `Intensidad ${perfil.ajustes.intensidad > 0 ? '+' : ''}${perfil.ajustes.intensidad}%`
    );
  }
  if (perfil.ajustes.enfasis.length > 0) {
    ajustesAplicados.push(`Enfasis: ${perfil.ajustes.enfasis.join(', ')}`);
  }

  const sesiones: SesionGenerada[] = patron.map((plantilla, index) => {
    const diaSemana = plantilla.diaSemana!;
    const tipoSesion = plantilla.tipoSesion!;
    const fecha = calcularFechaDia(datos.fechaInicio, diaSemana);

    // Aplicar ajustes del perfil
    const ajustes = aplicarAjustesPerfil(plantilla, perfil);

    // Generar contenido personalizado
    const contenido = generarContenido(perfil.perfil, tipoSesion, index);

    // Construir justificacion
    const justificacion = `Sesion generada para perfil ${perfil.perfil}. ${perfil.justificacion}`;

    return {
      fecha,
      diaSemana,
      numeroSesion: index + 1,
      tipoSesion,
      turno: 'COMPLETO' as Turno,
      tipoPlanificacion: 'INICIAL' as TipoPlanificacion,
      creadoPor: 'SISTEMA_ALGORITMO' as CreadoPor,
      duracionPlanificada: ajustes.duracion,
      volumenPlanificado: ajustes.volumen,
      intensidadPlanificada: ajustes.intensidad,
      contenidoFisico: contenido.fisico,
      contenidoTecnico: contenido.tecnico,
      contenidoTactico: contenido.tactico,
      calentamiento: generarCalentamiento(tipoSesion),
      partePrincipal: generarPartePrincipal(perfil.perfil, tipoSesion, contenido),
      vueltaCalma: generarVueltaCalma(tipoSesion),
      observaciones: `Objetivo semanal: ${datos.objetivoSemanal}`,
      aprobado: false,
      perfilUtilizado: perfil.perfil,
      justificacionAlgoritmo: justificacion,
    };
  });

  const justificacionGeneral =
    `Se generaron ${sesiones.length} sesiones para microciclo ${datos.tipoMicrociclo} ` +
    `con perfil ${perfil.perfil}. ${perfil.justificacion}`;

  return {
    sesiones,
    perfilUtilizado: perfil.perfil,
    justificacionGeneral,
    ajustesAplicados,
  };
}
