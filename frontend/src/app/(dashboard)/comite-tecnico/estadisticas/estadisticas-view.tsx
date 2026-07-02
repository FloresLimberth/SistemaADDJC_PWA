'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Dumbbell,
  Users,
  CheckCircle2,
  Target,
} from 'lucide-react';
import {
  fetchAtletaEvolucion,
  TIPOS_TEST,
  type AtletaEvolucion,
} from '@/features/comite-tecnico/actions';
import { fetchRankingAtleta } from '@/features/estadisticas/actions/fetch-ranking-atleta';
import { fetchBienestarAtleta } from '@/features/estadisticas/actions/fetch-bienestar-atleta';
import { fetchCargaPlanVsReal } from '@/features/estadisticas/actions/fetch-carga-plan-vs-real';
import type { RankingIndividual } from '@/features/estadisticas/actions/fetch-ranking-atleta';
import type { BienestarDataPoint } from '@/features/estadisticas/actions/fetch-bienestar-atleta';
import type { CargaPlanVsRealDataPoint } from '@/features/estadisticas/actions/fetch-carga-plan-vs-real';
import type { RankingOverviewData } from '@/features/estadisticas/actions/fetch-ranking-overview';
import type { EstadisticasRecomendaciones } from '@/features/estadisticas/actions/fetch-recomendaciones-stats';
import type { RadarTestDataPoint } from '@/features/estadisticas/types/estadisticas.types';
import { EvolucionChart } from './evolucion-chart';
import { RankingComparativoChart } from '@/features/estadisticas/components/ranking-comparativo-chart';
import { RecomendacionesDonutChart } from '@/features/estadisticas/components/recomendaciones-donut-chart';
import { AptitudCategoriaChart } from '@/features/estadisticas/components/aptitud-categoria-chart';
import { PerfilFisicoRadarChart } from '@/features/estadisticas/components/perfil-fisico-radar-chart';
import { ScoreDesgloseChart } from '@/features/estadisticas/components/score-desglose-chart';
import { BienestarTemporalChart } from '@/features/estadisticas/components/bienestar-temporal-chart';
import { IntensidadPlanVsRealChart } from '@/features/estadisticas/components/intensidad-plan-vs-real-chart';
import { RPEGrupalChart } from '@/features/estadisticas/components/rpe-grupal-chart';
import { AsistenciaGrupalChart } from '@/features/estadisticas/components/asistencia-grupal-chart';
import type { BienestarGrupalDataPoint } from '@/features/estadisticas/actions/fetch-bienestar-grupal';
import type { AsistenciaGrupalDataPoint } from '@/features/estadisticas/actions/fetch-asistencia-grupal';

interface Atleta {
  id: string;
  nombreCompleto: string;
  club: string;
  categoria: string;
}

interface EstadisticasViewProps {
  atletas: Atleta[];
  rankingOverview: RankingOverviewData | null;
  recomendacionesStats: EstadisticasRecomendaciones | null;
  bienestarGrupal: { data: BienestarGrupalDataPoint[]; meta: { dias: number; totalRegistros: number; atletasUnicos: number } } | null;
  asistenciaGrupal: { data: AsistenciaGrupalDataPoint[]; meta: { semanas: number; totalRegistros: number } } | null;
}

export function EstadisticasView({ atletas, rankingOverview, recomendacionesStats, bienestarGrupal, asistenciaGrupal }: EstadisticasViewProps) {
  // Estado para tab "Detalle por Atleta"
  const [selectedAtleta, setSelectedAtleta] = useState<string>('');
  const [selectedTipoTest, setSelectedTipoTest] = useState<string>('navette');
  const [evolucion, setEvolucion] = useState<AtletaEvolucion | null>(null);
  const [rankingAtleta, setRankingAtleta] = useState<RankingIndividual | null>(null);
  const [radarData, setRadarData] = useState<RadarTestDataPoint[]>([]);
  const [bienestarData, setBienestarData] = useState<BienestarDataPoint[]>([]);
  const [cargaData, setCargaData] = useState<CargaPlanVsRealDataPoint[]>([]);
  const [isPending, startTransition] = useTransition();

  // Cargar datos de atleta cuando cambia la seleccion
  useEffect(() => {
    if (!selectedAtleta) {
      setEvolucion(null);
      setRankingAtleta(null);
      setRadarData([]);
      setBienestarData([]);
      setCargaData([]);
      return;
    }

    startTransition(async () => {
      // Fetch en paralelo: evolucion + ranking + bienestar + carga
      const [evolucionData, rankingData, bienestarResult, cargaResult] = await Promise.all([
        fetchAtletaEvolucion(selectedAtleta, selectedTipoTest),
        fetchRankingAtleta(selectedAtleta),
        fetchBienestarAtleta(selectedAtleta, 60),
        fetchCargaPlanVsReal(selectedAtleta),
      ]);

      setEvolucion(evolucionData);
      setRankingAtleta(rankingData);
      setBienestarData(bienestarResult?.data || []);
      setCargaData(cargaResult?.data || []);

      // Generar datos radar si hay score con detalles
      if (rankingData?.score?.detalles) {
        const { detalles } = rankingData.score;
        const testsParaRadar: Partial<Record<string, number>> = {};

        // Usar ratios de fuerza si estan disponibles
        if (detalles.ratiosFuerza) {
          if (detalles.ratiosFuerza.pressBanca != null) testsParaRadar.pressBanca = detalles.ratiosFuerza.pressBanca * 80;
          if (detalles.ratiosFuerza.tiron != null) testsParaRadar.tiron = detalles.ratiosFuerza.tiron * 80;
          if (detalles.ratiosFuerza.sentadilla != null) testsParaRadar.sentadilla = detalles.ratiosFuerza.sentadilla * 120;
        }

        // Usar detalles directos como sub-scores normalizados
        // Construir radar con 6 metricas del score
        const radarFromScore: RadarTestDataPoint[] = [
          { metrica: 'Fuerza Max', valor: Math.round(detalles.fuerzaMaxima), valorReal: detalles.fuerzaMaxima, unidad: 'score' },
          { metrica: 'Fuerza Res.', valor: Math.round(detalles.fuerzaResistencia), valorReal: detalles.fuerzaResistencia, unidad: 'score' },
          { metrica: 'Resistencia', valor: Math.round(detalles.resistenciaAerobica), valorReal: detalles.resistenciaAerobica, unidad: 'score' },
          { metrica: 'Recuperacion', valor: Math.round(detalles.calidadRecuperacion), valorReal: detalles.calidadRecuperacion, unidad: 'score' },
          { metrica: 'Estado Mental', valor: Math.round(detalles.estadoMental), valorReal: detalles.estadoMental, unidad: 'score' },
          { metrica: 'Peso', valor: Math.round(Math.max(0, 100 - detalles.distanciaPesoOptimo)), valorReal: detalles.distanciaPesoOptimo, unidad: '% dist.' },
        ];

        setRadarData(radarFromScore);
      } else {
        setRadarData([]);
      }
    });
  }, [selectedAtleta, selectedTipoTest]);

  // Refetch solo evolucion cuando cambia tipo de test (sin cambiar atleta)
  useEffect(() => {
    if (!selectedAtleta) return;

    startTransition(async () => {
      const data = await fetchAtletaEvolucion(selectedAtleta, selectedTipoTest);
      setEvolucion(data);
    });
    // Solo ejecutar cuando cambia el tipo de test, no el atleta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTipoTest]);

  const atletaSeleccionado = atletas.find((a) => a.id === selectedAtleta);
  const tipoTestInfo = TIPOS_TEST.find((t) => t.value === selectedTipoTest);

  // KPIs del overview
  const totalAtletas = rankingOverview?.totalGeneral || 0;
  const totalAptos = rankingOverview?.atletas.filter((a) => a.aptoPara === 'COMPETIR').length || 0;
  const tasaAprobacion = recomendacionesStats?.tasaAprobacion ?? 0;

  // Renderizar badge de tendencia
  // Valores del backend: 'MEJORANDO' | 'ESTANCADO' | 'EMPEORANDO'
  const renderTendencia = (tendencia: string | undefined) => {
    if (!tendencia) return null;
    switch (tendencia) {
      case 'MEJORANDO':
        return (
          <Badge variant="default" className="bg-green-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            Mejorando
          </Badge>
        );
      case 'EMPEORANDO':
        return (
          <Badge variant="destructive">
            <TrendingDown className="h-3 w-3 mr-1" />
            Empeorando
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Minus className="h-3 w-3 mr-1" />
            Estancado
          </Badge>
        );
    }
  };

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general">Vision General</TabsTrigger>
        <TabsTrigger value="detalle">Detalle por Atleta</TabsTrigger>
      </TabsList>

      {/* Tab: Vision General */}
      <TabsContent value="general" className="space-y-6">
        {/* KPI cards del overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Atletas</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                {totalAtletas}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Evaluados en ranking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Aptos para Competir</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {totalAptos}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {totalAtletas > 0 ? `${Math.round((totalAptos / totalAtletas) * 100)}% del total` : 'Sin datos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tasa Aprobacion Recomendaciones</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                {tasaAprobacion.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {recomendacionesStats?.resumen.total || 0} recomendaciones totales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Comparativo (full width) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ranking Comparativo de Atletas
            </CardTitle>
            <CardDescription>
              Puntuacion global de cada atleta, coloreado por aptitud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RankingComparativoChart data={rankingOverview?.atletas || []} />
          </CardContent>
        </Card>

        {/* Donut + Aptitud por Categoria (2 columnas) */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones del Sistema</CardTitle>
              <CardDescription>
                Distribucion por estado de las recomendaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recomendacionesStats ? (
                <RecomendacionesDonutChart data={recomendacionesStats} />
              ) : (
                <EstadoVacioInline mensaje="No hay datos de recomendaciones disponibles." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aptitud por Categoria de Peso</CardTitle>
              <CardDescription>
                Distribucion de aptos, reservas y no aptos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AptitudCategoriaChart data={rankingOverview?.estadisticasCategorias || []} />
            </CardContent>
          </Card>
        </div>

        {/* RPE Grupal + Asistencia (2 columnas) - Datos reales de entrenamiento */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                RPE Grupal del Equipo
              </CardTitle>
              <CardDescription>
                Carga percibida promedio, maxima y minima de todos los atletas (ultimos 60 dias)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RPEGrupalChart data={bienestarGrupal?.data || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Asistencia Semanal
              </CardTitle>
              <CardDescription>
                Registros de asistencia e inasistencia por semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AsistenciaGrupalChart data={asistenciaGrupal?.data || []} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Tab: Detalle por Atleta */}
      <TabsContent value="detalle" className="space-y-6">
        {/* Selectores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Seleccionar Atleta y Metrica
            </CardTitle>
            <CardDescription>
              Elige un atleta y el tipo de test para ver su evolucion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="atleta">Atleta</Label>
                <Select value={selectedAtleta} onValueChange={setSelectedAtleta}>
                  <SelectTrigger id="atleta">
                    <SelectValue placeholder="Selecciona un atleta" />
                  </SelectTrigger>
                  <SelectContent>
                    {atletas.map((atleta) => (
                      <SelectItem key={atleta.id} value={atleta.id}>
                        {atleta.nombreCompleto} - {atleta.club}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoTest">Tipo de Test</Label>
                <Select value={selectedTipoTest} onValueChange={setSelectedTipoTest}>
                  <SelectTrigger id="tipoTest">
                    <SelectValue placeholder="Selecciona tipo de test" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_TEST.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label} ({tipo.unidad})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de carga */}
        {isPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando estadisticas...</span>
          </div>
        )}

        {/* Mensaje si no hay atleta seleccionado */}
        {!selectedAtleta && !isPending && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Selecciona un atleta</h3>
              <p className="text-muted-foreground mt-1">
                Elige un atleta del selector para ver sus estadisticas y evolucion
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contenido cuando hay atleta seleccionado */}
        {selectedAtleta && !isPending && (
          <>
            {/* Info del atleta y KPIs */}
            {atletaSeleccionado && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Atleta</CardDescription>
                    <CardTitle className="text-lg">{atletaSeleccionado.nombreCompleto}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {atletaSeleccionado.club} - {atletaSeleccionado.categoria}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Tests Registrados</CardDescription>
                    <CardTitle className="text-2xl">
                      {evolucion?.tests?.length || 0}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {tipoTestInfo?.label}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Tendencia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderTendencia(evolucion?.tendencia)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Progreso Total</CardDescription>
                    <CardTitle className="text-2xl">
                      {evolucion?.mejora
                        ? `${evolucion.mejora.porcentaje >= 0 ? '+' : ''}${evolucion.mejora.porcentaje.toFixed(1)}%`
                        : 'N/A'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {evolucion?.mejora
                        ? `${evolucion.mejora.absoluto >= 0 ? '+' : ''}${evolucion.mejora.absoluto.toFixed(2)} ${tipoTestInfo?.unidad}`
                        : 'Sin datos suficientes'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Grafico de evolucion (full width) - va primero porque es el test seleccionado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Evolucion de {tipoTestInfo?.label}
                </CardTitle>
                <CardDescription>
                  Historial de resultados a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evolucion && evolucion.tests && evolucion.tests.length > 0 ? (
                  <EvolucionChart
                    data={evolucion.tests}
                    unidad={tipoTestInfo?.unidad || ''}
                    nombreTest={tipoTestInfo?.label || ''}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/50 rounded-lg">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Sin datos disponibles</h3>
                    <p className="text-muted-foreground mt-1">
                      No hay registros de {tipoTestInfo?.label} para este atleta
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Radar + Score Desglose (2 columnas) */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil Fisico</CardTitle>
                  <CardDescription>
                    Capacidades normalizadas del atleta (0-100)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PerfilFisicoRadarChart data={radarData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Desglose de Score</CardTitle>
                  <CardDescription>
                    Componentes del score holistico del atleta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rankingAtleta?.score ? (
                    <ScoreDesgloseChart score={rankingAtleta.score} />
                  ) : (
                    <EstadoVacioInline mensaje="No hay score calculado para este atleta." />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bienestar Temporal + Intensidad Plan vs Real (2 columnas) */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Bienestar Temporal
                  </CardTitle>
                  <CardDescription>
                    RPE, calidad de sueno y estado animico (ultimos 60 dias)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BienestarTemporalChart data={bienestarData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Intensidad Plan vs Real
                  </CardTitle>
                  <CardDescription>
                    Comparacion de intensidad planificada contra alcanzada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IntensidadPlanVsRealChart data={cargaData} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}

// Componente inline para estado vacio dentro de una Card ya existente
function EstadoVacioInline({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">{mensaje}</p>
    </div>
  );
}
