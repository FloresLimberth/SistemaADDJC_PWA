'use client';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ArrowRightLeft,
  CircleCheck,
} from 'lucide-react';
import type { RendimientoPorTipo } from '../types/algoritmo.types';

interface TendenciaChartProps {
  rendimientoPorTipo: RendimientoPorTipo[];
}

// Nombres legibles para tipos de ejercicio (lenguaje de entrenador, no de desarrollador)
const TIPO_LABELS: Record<string, string> = {
  FISICO: 'Preparacion fisica',
  TECNICO_TACHI: 'Tecnica de pie (Tachi-waza)',
  TECNICO_NE: 'Tecnica de suelo (Ne-waza)',
  RESISTENCIA: 'Resistencia',
  VELOCIDAD: 'Velocidad',
};

// Z-Score traducido a etiquetas que un entrenador entiende
// (investigacion: ninguna app de consumo muestra z-scores numericos)
const INTERPRETACION_LABELS: Record<string, string> = {
  CRITICO_BAJO: 'Muy por debajo de lo habitual',
  ALERTA_BAJA: 'Por debajo de lo habitual',
  NORMAL: 'Normal',
  ALERTA_ALTA: 'Por encima de lo habitual',
  CRITICO_ALTO: 'Muy por encima de lo habitual',
};

// Colores semanticos por interpretacion (triple redundancia: color + icono + texto)
function getInterpretacionStyle(interpretacion: string) {
  switch (interpretacion) {
    case 'CRITICO_BAJO':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        bar: 'bg-red-500',
        ring: 'ring-red-500/20',
      };
    case 'ALERTA_BAJA':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        bar: 'bg-amber-500',
        ring: 'ring-amber-500/20',
      };
    case 'NORMAL':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        bar: 'bg-emerald-500',
        ring: 'ring-emerald-500/20',
      };
    case 'ALERTA_ALTA':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        bar: 'bg-blue-500',
        ring: 'ring-blue-500/20',
      };
    case 'CRITICO_ALTO':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        bar: 'bg-purple-500',
        ring: 'ring-purple-500/20',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        bar: 'bg-gray-400',
        ring: 'ring-gray-500/20',
      };
  }
}

// Color de la barra de rendimiento segun el valor
function getRendimientoBarColor(valor: number): string {
  if (valor >= 7.5) return 'bg-emerald-500';
  if (valor >= 6) return 'bg-blue-500';
  if (valor >= 4.5) return 'bg-amber-500';
  return 'bg-red-500';
}

// Color del texto de rendimiento
function getRendimientoTextColor(valor: number): string {
  if (valor >= 7.5) return 'text-emerald-700';
  if (valor >= 6) return 'text-blue-700';
  if (valor >= 4.5) return 'text-amber-700';
  return 'text-red-700';
}

// Icono y texto de tendencia (reemplaza "Pendiente: -0.016")
// Solo mostramos tendencia si R² > 0.5 (modelo confiable)
function TendenciaIndicator({
  tendencia,
  rSquared,
}: {
  tendencia: string;
  rSquared: number;
}) {
  if (rSquared < 0.3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <Minus className="w-3 h-3" />
        Sin tendencia clara
      </span>
    );
  }

  switch (tendencia) {
    case 'MEJORANDO':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
          <TrendingUp className="w-3.5 h-3.5" />
          Mejorando
        </span>
      );
    case 'EMPEORANDO':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
          <TrendingDown className="w-3.5 h-3.5" />
          Empeorando
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Minus className="w-3 h-3" />
          Estable
        </span>
      );
  }
}

// Porcentaje de completacion
function calcularPorcentajeCompletacion(
  completados: number,
  asignados: number,
): number {
  if (asignados === 0) return 100;
  return Math.round((completados / asignados) * 100);
}

// Componente de rendimiento por tipo de ejercicio
// Reemplaza z-score, R², pendiente por etiquetas humanas
export function TendenciaChart({ rendimientoPorTipo }: TendenciaChartProps) {
  if (rendimientoPorTipo.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        No hay datos de rendimiento por tipo de ejercicio.
      </div>
    );
  }

  // Separar tipos problematicos de normales para mostrar problematicos mas grandes
  const tiposProblematicos = rendimientoPorTipo.filter(
    (t) =>
      t.zScore.interpretacion === 'CRITICO_BAJO' ||
      t.zScore.interpretacion === 'ALERTA_BAJA' ||
      t.ejerciciosProblematicos.length > 0,
  );
  const tiposNormales = rendimientoPorTipo.filter(
    (t) =>
      t.zScore.interpretacion !== 'CRITICO_BAJO' &&
      t.zScore.interpretacion !== 'ALERTA_BAJA' &&
      t.ejerciciosProblematicos.length === 0,
  );

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">
        Rendimiento por tipo de ejercicio
      </h3>

      {/* Tipos problematicos primero - mas grandes, con detalle */}
      {tiposProblematicos.map((tipo) => (
        <TipoCardProblematico key={tipo.tipo} tipo={tipo} />
      ))}

      {/* Tipos normales en grid compacto */}
      {tiposNormales.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiposNormales.map((tipo) => (
            <TipoCardNormal key={tipo.tipo} tipo={tipo} />
          ))}
        </div>
      )}
    </div>
  );
}

// Card para tipo de ejercicio con problemas (mas grande, con detalles)
function TipoCardProblematico({ tipo }: { tipo: RendimientoPorTipo }) {
  const style = getInterpretacionStyle(tipo.zScore.interpretacion);
  const esCritico = tipo.zScore.interpretacion === 'CRITICO_BAJO';

  // Calcular completacion total del tipo
  const totalAsignado = tipo.ejerciciosProblematicos.reduce(
    (sum, ej) => sum + ej.vecesAsignado,
    0,
  );
  const totalCompletado = tipo.ejerciciosProblematicos.reduce(
    (sum, ej) => sum + ej.vecesCompletado,
    0,
  );

  return (
    <div
      className={`rounded-xl border ${esCritico ? 'border-2 border-red-200' : 'border-gray-200'} bg-white overflow-hidden relative`}
    >
      {/* Indicador de atencion */}
      {esCritico && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
          Requiere atencion
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {TIPO_LABELS[tipo.tipo] || tipo.tipo}
            </h4>
            <span className="text-xs text-gray-500">
              {tipo.cantidadRegistros} registros analizados
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text} ${style.border} border`}
          >
            {esCritico && <AlertTriangle className="w-3 h-3" />}
            {INTERPRETACION_LABELS[tipo.zScore.interpretacion] ||
              tipo.zScore.interpretacion}
          </span>
        </div>

        {/* Rendimiento + barra */}
        <div className="flex items-end gap-2 mb-1">
          <span
            className={`text-3xl font-bold tabular-nums ${getRendimientoTextColor(tipo.rendimientoPromedio)}`}
          >
            {tipo.rendimientoPromedio.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400 mb-1">/10</span>
          <div className="ml-auto">
            <TendenciaIndicator
              tendencia={tipo.tendencia.tendencia}
              rSquared={tipo.tendencia.rSquared}
            />
          </div>
        </div>
        <div className="h-2 rounded-full bg-gray-100 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${getRendimientoBarColor(tipo.rendimientoPromedio)}`}
            style={{
              width: `${Math.min(tipo.rendimientoPromedio * 10, 100)}%`,
            }}
          />
        </div>

        {/* Ejercicios problematicos con detalle */}
        {tipo.ejerciciosProblematicos.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              Ejercicios con dificultad ({tipo.ejerciciosProblematicos.length}):
            </p>
            <div className="space-y-2">
              {tipo.ejerciciosProblematicos.map((ej) => {
                const pctCompletado = calcularPorcentajeCompletacion(
                  ej.vecesCompletado,
                  ej.vecesAsignado,
                );
                const barColor =
                  pctCompletado === 0
                    ? 'bg-red-500'
                    : pctCompletado < 50
                      ? 'bg-amber-500'
                      : 'bg-blue-500';
                return (
                  <div
                    key={ej.ejercicioId}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ej.nombre}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className={`text-sm font-bold tabular-nums ${getRendimientoTextColor(ej.rendimientoPromedio)}`}
                      >
                        {ej.rendimientoPromedio.toFixed(1)}
                      </span>
                      <div className="w-20">
                        <div className="h-1.5 rounded-full bg-gray-200">
                          <div
                            className={`h-1.5 rounded-full ${barColor}`}
                            style={{ width: `${pctCompletado}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 text-center tabular-nums">
                          {ej.vecesCompletado} de {ej.vecesAsignado}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alternativas sugeridas - panel visible */}
            {(() => {
              const todasAlternativas = tipo.ejerciciosProblematicos.flatMap(
                (ej) => ej.alternativasSugeridas,
              );
              // Deduplicar por nombre
              const alternativasUnicas = todasAlternativas.filter(
                (alt, index, self) =>
                  index === self.findIndex((a) => a.nombre === alt.nombre),
              );

              if (alternativasUnicas.length === 0) return null;

              return (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Alternativas sugeridas (menor dificultad)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {alternativasUnicas.map((alt) => (
                      <span
                        key={alt.ejercicioId}
                        className="inline-flex items-center text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-md font-medium"
                        title={alt.razon}
                      >
                        {alt.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Alternativas del tipo si no hay en ejercicios individuales */}
            {tipo.ejerciciosProblematicos.every(
              (ej) => ej.alternativasSugeridas.length === 0,
            ) &&
              tipo.alternativasSugeridasDelTipo.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Alternativas sugeridas para este tipo
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tipo.alternativasSugeridasDelTipo.map((alt) => (
                      <span
                        key={alt.ejercicioId}
                        className="inline-flex items-center text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-md font-medium"
                        title={alt.razon}
                      >
                        {alt.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

// Card compacta para tipo de ejercicio normal (sin problemas)
function TipoCardNormal({ tipo }: { tipo: RendimientoPorTipo }) {
  const style = getInterpretacionStyle(tipo.zScore.interpretacion);

  return (
    <div className={`rounded-xl border bg-white p-4 ${style.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">
          {TIPO_LABELS[tipo.tipo] || tipo.tipo}
        </h4>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
        >
          <CircleCheck className="w-3 h-3" />
          {INTERPRETACION_LABELS[tipo.zScore.interpretacion] || 'Normal'}
        </span>
      </div>

      {/* Rendimiento principal */}
      <div className="flex items-end gap-1 mb-1">
        <span
          className={`text-3xl font-bold tabular-nums ${getRendimientoTextColor(tipo.rendimientoPromedio)}`}
        >
          {tipo.rendimientoPromedio.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400 mb-1">/10</span>
      </div>

      {/* Barra de rendimiento */}
      <div className="h-2 rounded-full bg-gray-100 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${getRendimientoBarColor(tipo.rendimientoPromedio)}`}
          style={{
            width: `${Math.min(tipo.rendimientoPromedio * 10, 100)}%`,
          }}
        />
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{tipo.cantidadRegistros} registros</span>
        <TendenciaIndicator
          tendencia={tipo.tendencia.tendencia}
          rSquared={tipo.tendencia.rSquared}
        />
      </div>
    </div>
  );
}
