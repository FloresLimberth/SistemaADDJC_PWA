// Servicio para consultar y filtrar ejercicios del catalogo
// Filtra por perfil del atleta, dolencias activas, etapa y tipo de microciclo
// Basado en: docs/algoritmo_03_diseno.md

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TipoEjercicio, PerfilAtleta, TipoMicrociclo } from '@prisma/client';

// Mapeo de zonas de dolencias a zonas del catalogo
export const MAPEO_ZONAS_DOLENCIAS: Record<string, string[]> = {
  hombro: ['HOMBROS'],
  hombro_derecho: ['HOMBROS'],
  hombro_izquierdo: ['HOMBROS'],
  brazo: ['BRAZOS'],
  brazo_derecho: ['BRAZOS'],
  brazo_izquierdo: ['BRAZOS'],
  codo: ['BRAZOS'],
  muneca: ['BRAZOS', 'MUNECA'],
  mano: ['BRAZOS'],
  espalda: ['ESPALDA'],
  espalda_alta: ['ESPALDA'],
  espalda_baja: ['ESPALDA', 'CORE'],
  lumbar: ['ESPALDA', 'CORE'],
  cuello: ['CUELLO'],
  cervical: ['CUELLO'],
  cadera: ['CADERA'],
  pierna: ['PIERNAS'],
  pierna_derecha: ['PIERNAS'],
  pierna_izquierda: ['PIERNAS'],
  rodilla: ['PIERNAS'],
  rodilla_derecha: ['PIERNAS'],
  rodilla_izquierda: ['PIERNAS'],
  tobillo: ['PIERNAS'],
  pie: ['PIERNAS'],
  abdomen: ['CORE'],
  core: ['CORE'],
  general: ['GENERAL'],
};

// Mapeo de EtapaMesociclo (enum de planificacion) a etapas del catalogo de ejercicios
// El catalogo tiene valores mas granulares que el enum de mesociclos
export const MAPEO_ETAPAS_MESOCICLO: Record<string, string[]> = {
  PREPARACION_GENERAL: ['GENERAL'],
  PREPARACION_ESPECIFICA: ['ESPECIFICA', 'ESPECIFICA_I', 'ESPECIFICA_II'],
  COMPETITIVA: ['COMPETITIVA', 'PRE_COMPETITIVA'],
  TRANSICION: ['TRANSICION'],
};

// Dolencia activa del atleta
export interface DolenciaActiva {
  zona: string;
  nivel: number;
}

// Datos de estado del atleta desde post-entrenamientos
export interface EstadoAtleta {
  rpePromedio: number;
  calidadSuenoPromedio: number;
  estadoAnimicoPromedio: number;
  diasDesdeUltimoDescanso: number;
}

// Ejercicio del catalogo
export interface EjercicioCatalogo {
  id: bigint;
  nombre: string;
  tipo: TipoEjercicio;
  subtipo: string | null;
  categoria: string | null;
  descripcion: string | null;
  zonasCuerpo: string[];
  perfilesRecomendados: string[];
  nivelDificultad: number | null;
  etapasRecomendadas: string[];
  tiposMicrociclo: string[];
  duracionMinutos: number | null;
  intensidadMinima: number | null;
  intensidadMaxima: number | null;
}

// Seleccion de ejercicios para una sesion
export interface SeleccionEjercicios {
  fisicos: EjercicioCatalogo[];
  tecnicosTachi: EjercicioCatalogo[];
  tecnicosNe: EjercicioCatalogo[];
  resistencia: EjercicioCatalogo[];
  velocidad: EjercicioCatalogo[];
  ejerciciosExcluidos: string[];
  alertas: string[];
}

// Ejercicio simplificado para guardar en sesion (preserva ID)
// Usado por: ejercicios_sesion en la BD
export interface EjercicioParaSesion {
  ejercicioId: bigint;
  nombre: string;
  tipo: TipoEjercicio;
  orden: number;
}

// Contenido de sesion extendido con IDs preservados
// Retorna tanto el texto (para campos existentes) como los IDs (para ejercicios_sesion)
export interface ContenidoSesionExtendido {
  // Texto para compatibilidad con campos existentes
  contenidoFisico: string;
  contenidoTecnico: string;
  contenidoTactico: string;
  partePrincipal: string;
  // Array de ejercicios con IDs para guardar en ejercicios_sesion
  ejercicios: EjercicioParaSesion[];
}

@Injectable()
export class CatalogoEjerciciosService {
  constructor(private prisma: PrismaService) {}

  // Convierte zona de dolencia a zonas del catalogo
  private convertirZonaDolencia(zonaDolencia: string): string[] {
    const zonaLower = zonaDolencia.toLowerCase().trim();
    return MAPEO_ZONAS_DOLENCIAS[zonaLower] || [zonaDolencia.toUpperCase()];
  }

  // Obtiene zonas afectadas por dolencias activas
  private obtenerZonasAfectadas(dolencias: DolenciaActiva[]): Set<string> {
    const zonasAfectadas = new Set<string>();
    for (const dolencia of dolencias) {
      // Solo considerar dolencias con nivel >= 4 (moderadas o graves)
      if (dolencia.nivel >= 4) {
        const zonas = this.convertirZonaDolencia(dolencia.zona);
        zonas.forEach((z) => zonasAfectadas.add(z));
      }
    }
    return zonasAfectadas;
  }

  // Convierte etapa de mesociclo a etapas compatibles del catalogo
  private convertirEtapaMesociclo(etapaMesociclo: string): string[] {
    return MAPEO_ETAPAS_MESOCICLO[etapaMesociclo] || [etapaMesociclo];
  }

  // Verifica si un ejercicio es compatible con la etapa del mesociclo
  private esCompatibleConEtapa(etapasEjercicio: string[], etapaMesociclo: string): boolean {
    if (etapasEjercicio.length === 0) {
      return true; // Sin restriccion de etapa = compatible con todas
    }
    const etapasCompatibles = this.convertirEtapaMesociclo(etapaMesociclo);
    return etapasEjercicio.some((etapa) => etapasCompatibles.includes(etapa));
  }

  // Busca ejercicios compatibles con el perfil y filtra por dolencias
  async buscarEjercicios(
    tipo: TipoEjercicio,
    perfilAtleta: PerfilAtleta,
    tipoMicrociclo: TipoMicrociclo,
    etapa: string | null,
    dolenciasActivas: DolenciaActiva[]
  ): Promise<{ ejercicios: EjercicioCatalogo[]; excluidos: string[] }> {
    const zonasAfectadas = this.obtenerZonasAfectadas(dolenciasActivas);
    const excluidos: string[] = [];

    // Buscar ejercicios del tipo especificado
    const ejerciciosDB = await this.prisma.catalogoEjercicios.findMany({
      where: {
        tipo,
        activo: true,
        perfilesRecomendados: {
          has: perfilAtleta,
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Filtrar ejercicios que afectan zonas lesionadas
    const ejerciciosFiltrados: EjercicioCatalogo[] = [];

    for (const ej of ejerciciosDB) {
      const zonasEjercicio = ej.zonasCuerpo || [];
      let excluido = false;

      // Verificar si alguna zona del ejercicio esta afectada
      for (const zona of zonasEjercicio) {
        if (zonasAfectadas.has(zona)) {
          excluidos.push(`${ej.nombre} (afecta ${zona})`);
          excluido = true;
          break;
        }
      }

      if (!excluido) {
        // Verificar tipo de microciclo si aplica
        const tiposMicro = ej.tiposMicrociclo || [];
        if (tiposMicro.length > 0 && !tiposMicro.includes(tipoMicrociclo)) {
          continue; // Saltar si no es compatible con el tipo de microciclo
        }

        // Verificar etapa si aplica (usa mapeo de EtapaMesociclo a etapas del catalogo)
        if (etapa) {
          const etapas = ej.etapasRecomendadas || [];
          if (!this.esCompatibleConEtapa(etapas, etapa)) {
            continue; // Saltar si no es compatible con la etapa
          }
        }

        ejerciciosFiltrados.push({
          id: ej.id,
          nombre: ej.nombre,
          tipo: ej.tipo,
          subtipo: ej.subtipo,
          categoria: ej.categoria,
          descripcion: ej.descripcion,
          zonasCuerpo: zonasEjercicio,
          perfilesRecomendados: ej.perfilesRecomendados || [],
          nivelDificultad: ej.nivelDificultad,
          etapasRecomendadas: ej.etapasRecomendadas || [],
          tiposMicrociclo: tiposMicro,
          duracionMinutos: ej.duracionMinutos,
          intensidadMinima: ej.intensidadMinima ? Number(ej.intensidadMinima) : null,
          intensidadMaxima: ej.intensidadMaxima ? Number(ej.intensidadMaxima) : null,
        });
      }
    }

    return { ejercicios: ejerciciosFiltrados, excluidos };
  }

  // Selecciona ejercicios aleatorios de una lista
  private seleccionarAleatorios(
    ejercicios: EjercicioCatalogo[],
    cantidad: number
  ): EjercicioCatalogo[] {
    if (ejercicios.length <= cantidad) {
      return ejercicios;
    }

    // Fisher-Yates shuffle y tomar los primeros N
    const shuffled = [...ejercicios];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, cantidad);
  }

  // Ajusta la intensidad segun el estado del atleta
  private ajustarPorFatiga(estado: EstadoAtleta | null): {
    factorIntensidad: number;
    alertas: string[];
  } {
    const alertas: string[] = [];
    let factorIntensidad = 1.0;

    if (!estado) {
      return { factorIntensidad, alertas };
    }

    // RPE alto indica fatiga
    if (estado.rpePromedio >= 8) {
      factorIntensidad *= 0.85;
      alertas.push('RPE alto detectado - reducir intensidad 15%');
    } else if (estado.rpePromedio >= 7) {
      factorIntensidad *= 0.95;
      alertas.push('RPE elevado - reducir intensidad 5%');
    }

    // Calidad de sueno baja
    if (estado.calidadSuenoPromedio <= 5) {
      factorIntensidad *= 0.9;
      alertas.push('Calidad de sueno baja - reducir intensidad 10%');
    }

    // Estado animico bajo
    if (estado.estadoAnimicoPromedio <= 5) {
      factorIntensidad *= 0.95;
      alertas.push('Estado animico bajo - reducir intensidad 5%');
    }

    // Poco descanso
    if (estado.diasDesdeUltimoDescanso >= 5) {
      factorIntensidad *= 0.9;
      alertas.push('Muchos dias sin descanso - reducir intensidad 10%');
    }

    return { factorIntensidad, alertas };
  }

  // Selecciona ejercicios completos para una sesion
  async seleccionarEjerciciosParaSesion(
    perfilAtleta: PerfilAtleta,
    tipoMicrociclo: TipoMicrociclo,
    etapa: string | null,
    dolenciasActivas: DolenciaActiva[],
    estadoAtleta: EstadoAtleta | null,
    cantidadPorTipo: number = 1
  ): Promise<SeleccionEjercicios> {
    const alertas: string[] = [];
    const todosExcluidos: string[] = [];

    // Ajustar por fatiga
    const ajusteFatiga = this.ajustarPorFatiga(estadoAtleta);
    alertas.push(...ajusteFatiga.alertas);

    // Buscar ejercicios de cada tipo
    const [fisicosRes, tachiRes, neRes, resistenciaRes, velocidadRes] = await Promise.all([
      this.buscarEjercicios('FISICO', perfilAtleta, tipoMicrociclo, etapa, dolenciasActivas),
      this.buscarEjercicios('TECNICO_TACHI', perfilAtleta, tipoMicrociclo, etapa, dolenciasActivas),
      this.buscarEjercicios('TECNICO_NE', perfilAtleta, tipoMicrociclo, etapa, dolenciasActivas),
      this.buscarEjercicios('RESISTENCIA', perfilAtleta, tipoMicrociclo, etapa, dolenciasActivas),
      this.buscarEjercicios('VELOCIDAD', perfilAtleta, tipoMicrociclo, etapa, dolenciasActivas),
    ]);

    // Recolectar excluidos
    todosExcluidos.push(...fisicosRes.excluidos);
    todosExcluidos.push(...tachiRes.excluidos);
    todosExcluidos.push(...neRes.excluidos);
    todosExcluidos.push(...resistenciaRes.excluidos);
    todosExcluidos.push(...velocidadRes.excluidos);

    // Alertas si hay pocos ejercicios disponibles
    if (fisicosRes.ejercicios.length < cantidadPorTipo) {
      alertas.push(`Solo ${fisicosRes.ejercicios.length} ejercicios fisicos disponibles`);
    }
    if (tachiRes.ejercicios.length < cantidadPorTipo) {
      alertas.push(`Solo ${tachiRes.ejercicios.length} ejercicios tachi-waza disponibles`);
    }

    // Seleccionar ejercicios aleatorios (1 de cada tipo = 5 ejercicios por sesion)
    return {
      fisicos: this.seleccionarAleatorios(fisicosRes.ejercicios, cantidadPorTipo),
      tecnicosTachi: this.seleccionarAleatorios(tachiRes.ejercicios, cantidadPorTipo),
      tecnicosNe: this.seleccionarAleatorios(neRes.ejercicios, cantidadPorTipo),
      resistencia: this.seleccionarAleatorios(resistenciaRes.ejercicios, cantidadPorTipo),
      velocidad: this.seleccionarAleatorios(velocidadRes.ejercicios, cantidadPorTipo),
      ejerciciosExcluidos: todosExcluidos,
      alertas,
    };
  }

  // Genera el contenido de texto para una sesion
  generarContenidoSesion(seleccion: SeleccionEjercicios): {
    contenidoFisico: string;
    contenidoTecnico: string;
    contenidoTactico: string;
    partePrincipal: string;
  } {
    // Contenido fisico
    const nombresFisicos = seleccion.fisicos.map((e) => e.nombre);
    const nombresResistencia = seleccion.resistencia.map((e) => e.nombre);
    const nombresVelocidad = seleccion.velocidad.map((e) => e.nombre);
    const contenidoFisico =
      [...nombresFisicos, ...nombresResistencia, ...nombresVelocidad].join(', ') ||
      'Trabajo fisico general';

    // Contenido tecnico
    const nombresTachi = seleccion.tecnicosTachi.map((e) => e.nombre);
    const nombresNe = seleccion.tecnicosNe.map((e) => e.nombre);
    const contenidoTecnico =
      [
        nombresTachi.length > 0 ? `Tachi-waza: ${nombresTachi.join(', ')}` : '',
        nombresNe.length > 0 ? `Ne-waza: ${nombresNe.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join(' | ') || 'Trabajo tecnico general';

    // Contenido tactico (basado en los tipos de ejercicios seleccionados)
    const categorias = new Set<string>();
    for (const ej of [...seleccion.tecnicosTachi, ...seleccion.tecnicosNe]) {
      if (ej.categoria) categorias.add(ej.categoria);
    }
    const contenidoTactico =
      categorias.size > 0
        ? `Enfoque tactico: ${Array.from(categorias).join(', ')}`
        : 'Trabajo tactico general';

    // Parte principal estructurada
    const partes: string[] = [];
    if (contenidoFisico) partes.push(`FISICO: ${contenidoFisico}`);
    if (contenidoTecnico) partes.push(`TECNICO: ${contenidoTecnico}`);
    if (contenidoTactico) partes.push(`TACTICO: ${contenidoTactico}`);

    return {
      contenidoFisico,
      contenidoTecnico,
      contenidoTactico,
      partePrincipal: partes.join(' | '),
    };
  }

  // Genera contenido de sesion CON IDs preservados
  // Este metodo extiende generarContenidoSesion() para incluir los IDs
  // que se guardaran en la tabla ejercicios_sesion
  generarContenidoSesionConIds(seleccion: SeleccionEjercicios): ContenidoSesionExtendido {
    // Obtener el contenido de texto usando el metodo existente
    const contenidoTexto = this.generarContenidoSesion(seleccion);

    // Construir array de ejercicios con IDs preservados
    const ejercicios: EjercicioParaSesion[] = [];
    let orden = 1;

    // Agregar ejercicios fisicos
    for (const ej of seleccion.fisicos) {
      ejercicios.push({
        ejercicioId: ej.id,
        nombre: ej.nombre,
        tipo: ej.tipo,
        orden: orden++,
      });
    }

    // Agregar ejercicios de resistencia
    for (const ej of seleccion.resistencia) {
      ejercicios.push({
        ejercicioId: ej.id,
        nombre: ej.nombre,
        tipo: ej.tipo,
        orden: orden++,
      });
    }

    // Agregar ejercicios de velocidad
    for (const ej of seleccion.velocidad) {
      ejercicios.push({
        ejercicioId: ej.id,
        nombre: ej.nombre,
        tipo: ej.tipo,
        orden: orden++,
      });
    }

    // Agregar ejercicios tecnicos tachi-waza
    for (const ej of seleccion.tecnicosTachi) {
      ejercicios.push({
        ejercicioId: ej.id,
        nombre: ej.nombre,
        tipo: ej.tipo,
        orden: orden++,
      });
    }

    // Agregar ejercicios tecnicos ne-waza
    for (const ej of seleccion.tecnicosNe) {
      ejercicios.push({
        ejercicioId: ej.id,
        nombre: ej.nombre,
        tipo: ej.tipo,
        orden: orden++,
      });
    }

    return {
      ...contenidoTexto,
      ejercicios,
    };
  }

  // Obtiene estadisticas del catalogo
  async obtenerEstadisticas(): Promise<{
    total: number;
    porTipo: Record<string, number>;
    porPerfil: Record<string, number>;
    porZona: Record<string, number>;
  }> {
    const ejercicios = await this.prisma.catalogoEjercicios.findMany({
      where: { activo: true },
      select: {
        tipo: true,
        perfilesRecomendados: true,
        zonasCuerpo: true,
      },
    });

    const porTipo: Record<string, number> = {};
    const porPerfil: Record<string, number> = {};
    const porZona: Record<string, number> = {};

    for (const ej of ejercicios) {
      // Por tipo
      porTipo[ej.tipo] = (porTipo[ej.tipo] || 0) + 1;

      // Por perfil
      for (const perfil of ej.perfilesRecomendados || []) {
        porPerfil[perfil] = (porPerfil[perfil] || 0) + 1;
      }

      // Por zona
      for (const zona of ej.zonasCuerpo || []) {
        porZona[zona] = (porZona[zona] || 0) + 1;
      }
    }

    return {
      total: ejercicios.length,
      porTipo,
      porPerfil,
      porZona,
    };
  }
}
