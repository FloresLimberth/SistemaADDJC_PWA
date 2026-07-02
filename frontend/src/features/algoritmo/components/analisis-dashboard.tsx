'use client';

import {
  AlertTriangle,
  Activity,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowDown,
  Plus,
  Lightbulb,
  RefreshCcw,
  ArrowRightLeft,
} from 'lucide-react';
import { TendenciaChart } from './tendencia-chart';
import type { AnalisisRendimiento } from '../types/algoritmo.types';

interface AnalisisDashboardProps {
  analisis: AnalisisRendimiento;
}

// Nombres legibles para tipos de ejercicio
const TIPO_LABELS: Record<string, string> = {
  FISICO: 'Preparacion fisica',
  TECNICO_TACHI: 'Tecnica de pie (Tachi-waza)',
  TECNICO_NE: 'Tecnica de suelo (Ne-waza)',
  RESISTENCIA: 'Resistencia',
  VELOCIDAD: 'Velocidad',
};

// Traduccion de patrones (antes: codigos como EJERCICIO_RECURRENTE_FALLA)
const PATRON_LABELS: Record<string, string> = {
  BAJO_RENDIMIENTO_TIPO: 'Bajo rendimiento general',
  EJERCICIO_RECURRENTE_FALLA: 'Ejercicio con fallas repetidas',
  TENDENCIA_NEGATIVA: 'Rendimiento en descenso',
  MEJORA_DETECTADA: 'Mejora detectada',
};

// Traduccion de prioridades
const PRIORIDAD_LABELS: Record<string, string> = {
  CRITICA: 'Critica',
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

// Estilos por severidad de patron
function getSeveridadStyle(severidad: string) {
  switch (severidad) {
    case 'CRITICA':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: ShieldAlert,
      };
    case 'ALTA':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: AlertTriangle,
      };
    case 'MEDIA':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: AlertTriangle,
      };
    default:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: TrendingUp,
      };
  }
}

// Estilos por prioridad de recomendacion
function getPrioridadStyle(prioridad: string) {
  switch (prioridad) {
    case 'CRITICA':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'ALTA':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'MEDIA':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    default:
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  }
}

// Dashboard completo de analisis de rendimiento
// Estructura ACDD: Alertas > KPIs > Recomendaciones con CTA > Detalle contextual
export function AnalisisDashboard({ analisis }: AnalisisDashboardProps) {
  // Encontrar el area mas fuerte y mas debil para los KPIs
  const tiposOrdenados = [...analisis.rendimientoPorTipo].sort(
    (a, b) => b.rendimientoPromedio - a.rendimientoPromedio,
  );
  const areaFuerte = tiposOrdenados[0];
  const areaDebil = tiposOrdenados[tiposOrdenados.length - 1];

  return (
    <div className="space-y-6">
      {/* Header con periodo */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Periodo:{' '}
          {new Date(analisis.periodoAnalisis.desde).toLocaleDateString(
            'es-BO',
          )}{' '}
          -{' '}
          {new Date(analisis.periodoAnalisis.hasta).toLocaleDateString(
            'es-BO',
          )}{' '}
          ({analisis.periodoAnalisis.diasAnalizados} dias)
        </p>
        {analisis.requiereAtencion && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700">
              Requiere atencion
            </span>
          </div>
        )}
      </div>

      {/* ============================== */}
      {/* SECCION 1: KPIs (Gutenberg: info critica arriba-izquierda) */}
      {/* ============================== */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Rendimiento global */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Rendimiento global
            </p>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-gray-900 tabular-nums">
              {analisis.resumenGeneral.rendimientoGlobalPromedio.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400 mb-1">/10</span>
          </div>
        </div>

        {/* Sesiones */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-violet-50">
              <ClipboardList className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Sesiones analizadas
            </p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900 tabular-nums">
              {analisis.resumenGeneral.totalSesiones}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {analisis.resumenGeneral.totalRegistros} registros de ejercicios
          </p>
        </div>

        {/* Area mas fuerte */}
        {areaFuerte && (
          <div className="bg-white rounded-xl border border-emerald-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-50">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Area mas fuerte
              </p>
            </div>
            <p className="text-lg font-bold text-emerald-700">
              {TIPO_LABELS[areaFuerte.tipo] || areaFuerte.tipo}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {areaFuerte.rendimientoPromedio.toFixed(1)}/10
            </p>
          </div>
        )}

        {/* Area critica */}
        {areaDebil && (
          <div className="bg-white rounded-xl border-2 border-red-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-red-50">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Area critica
              </p>
            </div>
            <p className="text-lg font-bold text-red-700">
              {TIPO_LABELS[areaDebil.tipo] || areaDebil.tipo}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {areaDebil.rendimientoPromedio.toFixed(1)}/10
            </p>
          </div>
        )}
      </div>

      {/* ============================== */}
      {/* SECCION 2: PROBLEMAS DETECTADOS (Framework ACDD: alertas primero) */}
      {/* ============================== */}
      {analisis.patrones.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Problemas detectados
            <span className="text-xs font-normal bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
              {analisis.patrones.length}{' '}
              {analisis.patrones.length === 1 ? 'problema' : 'problemas'}
            </span>
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {analisis.patrones.map((patron, i) => {
              const style = getSeveridadStyle(patron.severidad);
              const IconComponent = style.icon;

              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${style.bg} ${style.border}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 ${style.text} border ${style.border}`}
                    >
                      <IconComponent className="w-3 h-3" />
                      {PATRON_LABELS[patron.tipo] || patron.tipo}
                    </span>
                    {patron.severidad === 'CRITICA' && (
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                        {PRIORIDAD_LABELS[patron.severidad]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {patron.descripcion}
                  </p>
                  {patron.ejercicioAfectado && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ejercicio afectado:{' '}
                      <span className="font-medium text-gray-700">
                        {patron.ejercicioAfectado.nombre}
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* SECCION 3: RENDIMIENTO POR TIPO (cards con barras de progreso) */}
      {/* ============================== */}
      <TendenciaChart rendimientoPorTipo={analisis.rendimientoPorTipo} />

      {/* ============================== */}
      {/* SECCION 4: RECOMENDACIONES ACCIONABLES */}
      {/* ============================== */}
      {analisis.recomendaciones.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            Recomendaciones del sistema
            <span className="text-xs font-normal bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {analisis.recomendaciones.length}
            </span>
          </h2>

          <div className="space-y-3">
            {analisis.recomendaciones.map((rec, i) => {
              const style = getPrioridadStyle(rec.prioridad);

              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${style.bg} ${style.border}`}
                >
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 ${style.text} border ${style.border}`}
                    >
                      Prioridad{' '}
                      {PRIORIDAD_LABELS[rec.prioridad] || rec.prioridad}
                    </span>
                  </div>

                  {/* Titulo y mensaje */}
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {rec.titulo}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {rec.mensaje}
                  </p>

                  {/* Accion sugerida */}
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Acciones sugeridas:
                    </p>
                    <p className="text-xs text-gray-700">
                      {rec.accionSugerida}
                    </p>

                    {/* Cambios sugeridos con iconos */}
                    {rec.cambiosSugeridos && (
                      <div className="mt-2 space-y-1.5">
                        {rec.cambiosSugeridos.reducir.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                              <ArrowDown className="w-2.5 h-2.5 text-red-600" />
                            </span>
                            <p className="text-xs text-gray-700">
                              <span className="font-medium">Reducir:</span>{' '}
                              {rec.cambiosSugeridos.reducir
                                .map((c) => c.nombre)
                                .join(', ')}
                            </p>
                          </div>
                        )}
                        {rec.cambiosSugeridos.agregar.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                              <Plus className="w-2.5 h-2.5 text-emerald-600" />
                            </span>
                            <p className="text-xs text-gray-700">
                              <span className="font-medium">Agregar:</span>{' '}
                              {rec.cambiosSugeridos.agregar
                                .map((c) => c.nombre)
                                .join(', ')}
                            </p>
                          </div>
                        )}
                        {rec.cambiosSugeridos.modificar.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                              <RefreshCcw className="w-2.5 h-2.5 text-amber-600" />
                            </span>
                            <p className="text-xs text-gray-700">
                              <span className="font-medium">
                                Modificar:
                              </span>{' '}
                              {rec.cambiosSugeridos.modificar
                                .map((c) => c.cambio)
                                .join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* SECCION 5: EJERCICIOS PROBLEMATICOS GLOBALES (si hay adicionales) */}
      {/* ============================== */}
      {analisis.ejerciciosProblematicos.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            Ejercicios que necesitan atencion
            <span className="text-xs font-normal bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
              {analisis.ejerciciosProblematicos.length}
            </span>
          </h2>

          <div className="space-y-2">
            {analisis.ejerciciosProblematicos.map((ej) => {
              const pctCompletado =
                ej.vecesAsignado > 0
                  ? Math.round(
                      (ej.vecesCompletado / ej.vecesAsignado) * 100,
                    )
                  : 100;
              const barColor =
                pctCompletado === 0
                  ? 'bg-red-500'
                  : pctCompletado < 50
                    ? 'bg-amber-500'
                    : 'bg-blue-500';
              const rendColor =
                ej.rendimientoPromedio >= 7
                  ? 'text-emerald-700'
                  : ej.rendimientoPromedio >= 5
                    ? 'text-amber-700'
                    : 'text-red-700';

              return (
                <div
                  key={ej.ejercicioId}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {ej.nombre}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {TIPO_LABELS[ej.tipo] || ej.tipo}
                      </span>
                    </div>
                    <span
                      className={`text-lg font-bold tabular-nums ${rendColor}`}
                    >
                      {ej.rendimientoPromedio.toFixed(1)}
                      <span className="text-xs text-gray-400 font-normal">
                        /10
                      </span>
                    </span>
                  </div>

                  {/* Barra de completacion */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${barColor}`}
                        style={{ width: `${pctCompletado}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums shrink-0">
                      {ej.vecesCompletado}/{ej.vecesAsignado} completados
                    </span>
                  </div>

                  {/* Alternativas */}
                  {ej.alternativasSugeridas.length > 0 && (
                    <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" />
                        Alternativas sugeridas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ej.alternativasSugeridas.map((alt) => (
                          <span
                            key={alt.ejercicioId}
                            className="inline-flex items-center text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-md font-medium"
                            title={alt.razon}
                          >
                            {alt.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
