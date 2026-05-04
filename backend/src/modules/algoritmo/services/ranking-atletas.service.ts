// Servicio de Ranking de Atletas para Competencias
// Usa las funciones de ranking.service.ts y score.calculator.ts
// Obtiene datos de la BD y genera ranking por categoria de peso

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../database/prisma.service';
import { CategoriaPeso } from '@prisma/client';
import {
  generarRanking,
  generarRankingGlobal,
  DatosAtletaParaRanking,
  ResultadoRanking,
} from './ranking.service';

// Tipo para el resultado de estadisticas (usado para cache tipado)
interface EstadisticasRankingResult {
  estadisticas: {
    categoria: string;
    totalAtletas: number;
    aptos: number;
    reservas: number;
    noAptos: number;
    mejorPuntuacion: number;
  }[];
  totalGeneral: number;
}

@Injectable()
export class RankingAtletasService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  // Genera ranking de atletas para una categoria de peso especifica
  async generarRankingPorCategoria(categoriaPeso: CategoriaPeso): Promise<ResultadoRanking> {
    const cacheKey = `ranking:${categoriaPeso}`;
    const cached = await this.cache.get<ResultadoRanking>(cacheKey);
    if (cached) return cached;

    // 1. Obtener atletas de la categoria con sus datos completos
    const atletas = await this.obtenerAtletasConDatos(categoriaPeso);

    // 2. Generar ranking usando la logica existente
    const ranking = generarRanking(atletas, categoriaPeso);

    const resultado = this.formatearResultado(ranking);
    await this.cache.set(cacheKey, resultado, 30000);
    return resultado;
  }

  // Genera ranking global para todas las categorias
  async generarRankingGlobal(): Promise<Map<string, ResultadoRanking>> {
    // 1. Obtener todos los atletas con sus datos
    const atletas = await this.obtenerAtletasConDatos(null);

    // 2. Generar ranking global
    const rankingsMap = generarRankingGlobal(atletas);

    // 3. Convertir Map a objeto para mejor serializacion
    const resultado = new Map<string, ResultadoRanking>();
    rankingsMap.forEach((ranking, categoria) => {
      resultado.set(categoria, this.formatearResultado(ranking));
    });

    return resultado;
  }

  // Obtiene ranking global como objeto (para serializar en JSON)
  async generarRankingGlobalComoObjeto(): Promise<Record<string, ResultadoRanking>> {
    const cacheKey = 'ranking:global';
    const cached = await this.cache.get<Record<string, ResultadoRanking>>(cacheKey);
    if (cached) return cached;

    const atletas = await this.obtenerAtletasConDatos(null);
    const rankingsMap = generarRankingGlobal(atletas);

    const resultado: Record<string, ResultadoRanking> = {};
    rankingsMap.forEach((ranking, categoria) => {
      resultado[categoria] = this.formatearResultado(ranking);
    });

    await this.cache.set(cacheKey, resultado, 60000);
    return resultado;
  }

  // Obtiene los mejores N atletas de una categoria
  // Ya usa cache indirectamente via generarRankingPorCategoria (30s TTL)
  async obtenerMejoresAtletas(categoriaPeso: CategoriaPeso, cantidad: number = 5) {
    const ranking = await this.generarRankingPorCategoria(categoriaPeso);

    const resultado = {
      categoriaPeso,
      mejores: ranking.ranking.slice(0, cantidad),
      totalAtletas: ranking.totalAtletas,
      resumen: ranking.resumen,
    };

    return resultado;
  }

  // Obtiene el ranking de un atleta especifico
  async obtenerRankingAtleta(atletaId: bigint) {
    // 1. Obtener datos del atleta
    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
      select: {
        id: true,
        categoriaPeso: true,
        usuario: { select: { nombreCompleto: true } },
      },
    });

    if (!atleta) {
      return null;
    }

    // 2. Generar ranking de su categoria
    const ranking = await this.generarRankingPorCategoria(atleta.categoriaPeso);

    // 3. Buscar al atleta en el ranking
    const atletaEnRanking = ranking.ranking.find(
      (a) => a.atletaId.toString() === atletaId.toString()
    );

    if (!atletaEnRanking) {
      return {
        atleta: {
          id: atleta.id.toString(),
          nombreCompleto: atleta.usuario.nombreCompleto,
          categoriaPeso: atleta.categoriaPeso,
        },
        posicion: null,
        mensaje: 'Atleta no tiene datos suficientes para ranking',
      };
    }

    return {
      atleta: {
        id: atleta.id.toString(),
        nombreCompleto: atleta.usuario.nombreCompleto,
        categoriaPeso: atleta.categoriaPeso,
      },
      posicion: atletaEnRanking.posicion,
      totalEnCategoria: ranking.totalAtletas,
      puntuacion: atletaEnRanking.puntuacion,
      score: atletaEnRanking.score,
      alertas: atletaEnRanking.alertas,
      justificacion: atletaEnRanking.justificacion,
      aptoPara: atletaEnRanking.aptoPara,
    };
  }

  // Obtiene atletas con todos sus datos necesarios para ranking
  // Optimizado: usa una sola raw query para dolencias en vez de N+1
  private async obtenerAtletasConDatos(
    categoriaPeso: CategoriaPeso | null
  ): Promise<DatosAtletaParaRanking[]> {
    const whereClause: any = {};
    if (categoriaPeso) {
      whereClause.categoriaPeso = categoriaPeso;
    }

    // Obtener atletas con tests y registros
    const atletas = await this.prisma.atleta.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: { nombreCompleto: true },
        },
        testsFisicos: {
          orderBy: { fechaTest: 'desc' },
          take: 1,
          select: {
            fechaTest: true,
            pressBanca: true,
            tiron: true,
            sentadilla: true,
            barraFija: true,
            paralelas: true,
            navetteVO2max: true,
          },
        },
        registrosPostEntrenamiento: {
          where: { asistio: true },
          orderBy: { fechaRegistro: 'desc' },
          take: 7,
          select: {
            rpe: true,
            calidadSueno: true,
            estadoAnimico: true,
          },
        },
      },
    });

    // Obtener conteo de dolencias activas para TODOS los atletas en una sola query
    const dolenciasPorAtleta = await this.prisma.$queryRaw<{ atletaId: bigint; count: bigint }[]>`
      SELECT r."atletaId", COUNT(d.id)::bigint as count
      FROM dolencias d
      JOIN registros_post_entrenamiento r ON d."registroPostEntrenamientoId" = r.id
      WHERE d.recuperado = false
      GROUP BY r."atletaId"
    `;

    // Construir Map para lookup O(1)
    const dolenciasMap = new Map<string, number>();
    for (const row of dolenciasPorAtleta) {
      dolenciasMap.set(row.atletaId.toString(), Number(row.count));
    }

    return atletas.map((atleta) => {
      const ultimoTest = atleta.testsFisicos[0] || null;
      const dolenciasActivas = dolenciasMap.get(atleta.id.toString()) || 0;

      return {
        atletaId: atleta.id,
        nombreCompleto: atleta.usuario.nombreCompleto,
        categoriaPeso: atleta.categoriaPeso,
        pesoActual: atleta.pesoActual ? Number(atleta.pesoActual) : null,
        edad: atleta.edad,
        ultimoTest: ultimoTest
          ? {
              fechaTest: ultimoTest.fechaTest,
              pressBanca: ultimoTest.pressBanca ? Number(ultimoTest.pressBanca) : null,
              tiron: ultimoTest.tiron ? Number(ultimoTest.tiron) : null,
              sentadilla: ultimoTest.sentadilla ? Number(ultimoTest.sentadilla) : null,
              barraFija: ultimoTest.barraFija,
              paralelas: ultimoTest.paralelas,
              navetteVO2max: ultimoTest.navetteVO2max ? Number(ultimoTest.navetteVO2max) : null,
            }
          : null,
        ultimosRegistros: atleta.registrosPostEntrenamiento.map((r) => ({
          rpe: r.rpe,
          calidadSueno: r.calidadSueno,
          estadoAnimico: r.estadoAnimico,
        })),
        dolenciasActivas,
      };
    });
  }

  // Formatea el resultado para serializar BigInt
  private formatearResultado(ranking: ResultadoRanking): ResultadoRanking {
    return {
      ...ranking,
      ranking: ranking.ranking.map((atleta) => ({
        ...atleta,
        atletaId: BigInt(atleta.atletaId.toString()),
      })),
      mejorAtleta: ranking.mejorAtleta
        ? {
            ...ranking.mejorAtleta,
            atletaId: BigInt(ranking.mejorAtleta.atletaId.toString()),
          }
        : null,
    };
  }

  // Obtiene estadisticas de ranking por categoria
  // Optimizado: una sola consulta de atletas en vez de 7 consultas separadas
  async obtenerEstadisticasRanking() {
    const cacheKey = 'ranking:estadisticas';
    const cached = await this.cache.get<EstadisticasRankingResult>(cacheKey);
    if (cached) return cached;

    const atletas = await this.obtenerAtletasConDatos(null);
    const rankingsMap = generarRankingGlobal(atletas);

    const estadisticas = [...rankingsMap.entries()].map(([categoria, ranking]) => {
      const formateado = this.formatearResultado(ranking);
      const aptos = formateado.ranking.filter((a) => a.aptoPara === 'COMPETIR').length;
      const reservas = formateado.ranking.filter((a) => a.aptoPara === 'RESERVA').length;
      const noAptos = formateado.ranking.filter((a) => a.aptoPara === 'NO_APTO').length;

      return {
        categoria,
        totalAtletas: formateado.totalAtletas,
        aptos,
        reservas,
        noAptos,
        mejorPuntuacion: formateado.mejorAtleta?.puntuacion || 0,
      };
    });

    const resultado: EstadisticasRankingResult = {
      estadisticas: estadisticas.filter((e) => e.totalAtletas > 0),
      totalGeneral: estadisticas.reduce((sum, e) => sum + e.totalAtletas, 0),
    };

    await this.cache.set(cacheKey, resultado, 60000);
    return resultado;
  }
}
