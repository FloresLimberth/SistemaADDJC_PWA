import { redirect } from 'next/navigation';
import { fetchVO2maxEvolution } from '@/features/progreso/actions/fetch-vo2max-evolution';
import { fetchRPEWeekly } from '@/features/progreso/actions/fetch-rpe-weekly';
import { fetchTestsComparison } from '@/features/progreso/actions/fetch-tests-comparison';
import { fetchSleepData } from '@/features/progreso/actions/fetch-sleep-data';
import { fetchEstadoAnimico } from '@/features/progreso/actions/fetch-estado-animico';
import { fetchBienestarPropio } from '@/features/progreso/actions/fetch-bienestar-propio';
import { fetchMiRanking } from '@/features/algoritmo/actions/fetch-ranking';
import { fetchMiAtletaId } from '@/features/progreso/actions/fetch-mi-atleta-id';
import { VO2maxEvolutionChart } from '@/features/progreso/components/vo2max-evolution-chart';
import { RPEWeeklyChart } from '@/features/progreso/components/rpe-weekly-chart';
import { TestsComparisonChart } from '@/features/progreso/components/tests-comparison-chart';
import { SleepQualityChart } from '@/features/progreso/components/sleep-quality-chart';
import { EstadoAnimicoChart } from '@/features/progreso/components/estado-animico-chart';
import { EvolucionTestSelector } from '@/features/progreso/components/evolucion-test-selector';
import { PerfilFisicoRadarChart } from '@/features/estadisticas/components/perfil-fisico-radar-chart';
import { ScoreDesgloseChart } from '@/features/estadisticas/components/score-desglose-chart';
import { BienestarTemporalChart } from '@/features/estadisticas/components/bienestar-temporal-chart';
import { ProgresoStatsGrid } from '@/features/progreso/components/progreso-stats-grid';
import type { ProgresoStats } from '@/features/progreso/types/progreso.types';
import type { RadarTestDataPoint } from '@/features/estadisticas/types/estadisticas.types';
import { AUTH_ROUTES } from '@/lib/routes';

// Pagina de progreso del atleta
// Server Component que hace fetch de todos los datos y los pasa a componentes cliente
export default async function ProgresoPage() {
  // Hacer fetch de todos los datos en paralelo para mejor performance
  const [
    vo2maxData,
    rpeData,
    testsComparison,
    sleepData,
    estadoAnimicoData,
    bienestarData,
    miRanking,
    miAtletaId,
  ] = await Promise.all([
    fetchVO2maxEvolution(),
    fetchRPEWeekly(),
    fetchTestsComparison(),
    fetchSleepData(),
    fetchEstadoAnimico(),
    fetchBienestarPropio(),
    fetchMiRanking(),
    fetchMiAtletaId(),
  ]);

  // Si los fetches principales fallan (usuario no autenticado), redirigir a login
  if (vo2maxData === null || rpeData === null || testsComparison === null || sleepData === null) {
    redirect(AUTH_ROUTES.login);
  }

  // Calcular estadisticas para el grid de KPIs
  const stats: ProgresoStats = {
    // VO2max actual (ultimo valor)
    vo2maxActual: vo2maxData.length > 0 ? vo2maxData[vo2maxData.length - 1].vo2max : null,
    vo2maxClasificacion: vo2maxData.length > 0 ? vo2maxData[vo2maxData.length - 1].clasificacion : null,

    // RPE promedio de las ultimas 4 semanas
    rpePromedio: rpeData.length > 0
      ? rpeData.slice(-4).reduce((acc, week) => acc + week.rpePromedio, 0) / Math.min(4, rpeData.length)
      : null,

    // Cantidad de tests realizados
    testsRealizados: vo2maxData.length,

    // Calidad de sueno promedio (ultimos 14 dias)
    calidadSuenoPromedio: sleepData.length > 0
      ? sleepData.slice(-14).reduce((acc, day) => acc + day.calidadSueno, 0) / Math.min(14, sleepData.length)
      : null,

    // Horas de sueno promedio (ultimos 14 dias)
    horasSuenoPromedio: sleepData.length > 0
      ? sleepData.slice(-14).reduce((acc, day) => acc + day.horasSueno, 0) / Math.min(14, sleepData.length)
      : null,
  };

  // Generar datos radar si hay ranking con detalles de score
  let radarData: RadarTestDataPoint[] = [];
  if (miRanking?.score?.detalles) {
    const { detalles } = miRanking.score;
    radarData = [
      { metrica: 'Fuerza Max', valor: Math.round(detalles.fuerzaMaxima), valorReal: detalles.fuerzaMaxima, unidad: 'score' },
      { metrica: 'Fuerza Res.', valor: Math.round(detalles.fuerzaResistencia), valorReal: detalles.fuerzaResistencia, unidad: 'score' },
      { metrica: 'Resistencia', valor: Math.round(detalles.resistenciaAerobica), valorReal: detalles.resistenciaAerobica, unidad: 'score' },
      { metrica: 'Recuperacion', valor: Math.round(detalles.calidadRecuperacion), valorReal: detalles.calidadRecuperacion, unidad: 'score' },
      { metrica: 'Estado Mental', valor: Math.round(detalles.estadoMental), valorReal: detalles.estadoMental, unidad: 'score' },
      { metrica: 'Peso', valor: Math.round(Math.max(0, 100 - detalles.distanciaPesoOptimo)), valorReal: detalles.distanciaPesoOptimo, unidad: '% dist.' },
    ];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Progreso</h1>
        <p className="text-gray-600 mt-1">
          Analisis de tu evolucion fisica y recuperacion
        </p>
      </div>

      {/* Grid de KPIs principales */}
      <ProgresoStatsGrid stats={stats} />

      {/* Grafico principal: Evolucion VO2max */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Evolucion VO2max</h2>
          <p className="text-sm text-gray-600 mt-1">
            Capacidad aerobica medida a traves del test de Navette
          </p>
        </div>
        <VO2maxEvolutionChart data={vo2maxData} />
      </div>

      {/* Grid de 2 columnas: RPE y Sueno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RPE Semanal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">RPE Semanal</h2>
            <p className="text-sm text-gray-600 mt-1">
              Carga de trabajo percibida por semana
            </p>
          </div>
          <RPEWeeklyChart data={rpeData} />
        </div>

        {/* Calidad de Sueno */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Calidad de Sueno</h2>
            <p className="text-sm text-gray-600 mt-1">
              Recuperacion y descanso nocturno
            </p>
          </div>
          <SleepQualityChart data={sleepData} />
        </div>
      </div>

      {/* Comparacion de Tests Fisicos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Comparacion Tests Fisicos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Test actual vs mejor marca personal
          </p>
        </div>
        <TestsComparisonChart data={testsComparison} />
      </div>

      {/* Radar Personal + Score Desglose (solo si hay ranking) */}
      {miRanking && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar de Perfil Fisico */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Perfil Fisico</h2>
              <p className="text-sm text-gray-600 mt-1">
                Capacidades normalizadas (0-100)
              </p>
            </div>
            <PerfilFisicoRadarChart data={radarData} />
          </div>

          {/* Desglose de Score */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Desglose de Score</h2>
              <p className="text-sm text-gray-600 mt-1">
                Componentes de tu puntuacion global ({miRanking.puntuacion.toFixed(1)} pts)
              </p>
            </div>
            <ScoreDesgloseChart score={miRanking.score} />
          </div>
        </div>
      )}

      {/* Estado Animico + Bienestar Integrado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado Animico */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Estado Animico</h2>
            <p className="text-sm text-gray-600 mt-1">
              Evolucion de tu estado de animo registrado
            </p>
          </div>
          {estadoAnimicoData && estadoAnimicoData.length > 0 ? (
            <EstadoAnimicoChart data={estadoAnimicoData} />
          ) : (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-gray-500 font-medium">Sin datos de estado animico</p>
                <p className="text-gray-400 text-sm mt-1">
                  Se generan a partir de tus registros post-entrenamiento
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bienestar Integrado */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Bienestar Integrado</h2>
            <p className="text-sm text-gray-600 mt-1">
              RPE, calidad de sueno y estado animico combinados
            </p>
          </div>
          {bienestarData && bienestarData.length > 0 ? (
            <BienestarTemporalChart data={bienestarData} />
          ) : (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-gray-500 font-medium">Sin datos de bienestar</p>
                <p className="text-gray-400 text-sm mt-1">
                  Se generan a partir de tus registros post-entrenamiento
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Evolucion por tipo de test (con selector interactivo) */}
      {miAtletaId && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Evolucion por Tipo de Test</h2>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona un test para ver tu progreso a lo largo del tiempo
            </p>
          </div>
          <EvolucionTestSelector atletaId={miAtletaId} />
        </div>
      )}
    </div>
  );
}
