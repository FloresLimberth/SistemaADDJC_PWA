'use client';

import { Target, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import type { Macrociclo, Mesociclo } from '@/features/comite-tecnico/types/planificacion.types';

interface CalendarioGeneralProps {
  macrociclo: Macrociclo | null;
  mesociclos: Mesociclo[];
  basePlanificacion: string;
  puedeEditar: boolean;
}

// Nombres de meses
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Estilos por etapa (tonalidades serias)
const ETAPA_STYLES: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  PREPARACION_GENERAL: { bg: 'bg-slate-50', border: 'border-slate-300', dot: 'bg-slate-600', text: 'text-slate-700' },
  PREPARACION_ESPECIFICA: { bg: 'bg-sky-50', border: 'border-sky-300', dot: 'bg-sky-600', text: 'text-sky-700' },
  COMPETITIVA: { bg: 'bg-orange-50', border: 'border-orange-300', dot: 'bg-orange-600', text: 'text-orange-700' },
  TRANSICION: { bg: 'bg-stone-50', border: 'border-stone-300', dot: 'bg-stone-500', text: 'text-stone-600' },
};

const ETAPA_LABELS: Record<string, string> = {
  PREPARACION_GENERAL: 'Prep. General',
  PREPARACION_ESPECIFICA: 'Prep. Especifica',
  COMPETITIVA: 'Competitiva',
  TRANSICION: 'Transicion',
};

const ESTADO_LABELS: Record<string, string> = {
  PLANIFICADO: 'Planificado',
  EN_CURSO: 'En curso',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

// Convierte string o Date a Date (las fechas llegan como string despues de serializacion)
function toDate(fecha: Date | string): Date {
  return typeof fecha === 'string' ? new Date(fecha) : fecha;
}

function formatFechaCorta(fecha: Date | string): string {
  const d = toDate(fecha);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]?.slice(0, 3) || ''}`;
}

function formatFechaLarga(fecha: Date | string): string {
  const d = toDate(fecha);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()] || ''} ${d.getUTCFullYear()}`;
}

function getMesesDelMacrociclo(fechaInicio: Date | string, fechaFin: Date | string): string[] {
  const inicio = toDate(fechaInicio);
  const fin = toDate(fechaFin);
  const meses: string[] = [];
  let current = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), 1));
  const finMes = new Date(Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth(), 1));

  while (current <= finMes) {
    meses.push(MESES[current.getUTCMonth()] || '');
    current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1));
  }
  return meses;
}

function getMesocicloColumnas(
  meso: Mesociclo,
  mesesMacro: string[],
  macroInicio: Date,
): { colStart: number; colSpan: number } {
  const mesoInicioMes = MESES[new Date(meso.fechaInicio).getUTCMonth()] || '';
  const mesoFinMes = MESES[new Date(meso.fechaFin).getUTCMonth()] || '';

  const colStart = mesesMacro.indexOf(mesoInicioMes);
  const colEnd = mesesMacro.indexOf(mesoFinMes);

  if (colStart === -1 || colEnd === -1) return { colStart: 1, colSpan: 1 };

  return { colStart: colStart + 1, colSpan: colEnd - colStart + 1 };
}

// Calcula el porcentaje de progreso temporal del macrociclo
function calcularProgreso(fechaInicio: Date | string, fechaFin: Date | string): number {
  const hoy = new Date();
  const inicio = toDate(fechaInicio).getTime();
  const fin = toDate(fechaFin).getTime();
  const actual = hoy.getTime();

  if (actual <= inicio) return 0;
  if (actual >= fin) return 100;

  return Math.round(((actual - inicio) / (fin - inicio)) * 100);
}

export function CalendarioGeneral({
  macrociclo,
  mesociclos,
  basePlanificacion,
  puedeEditar,
}: CalendarioGeneralProps) {
  if (!macrociclo) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No hay macrociclos disponibles</p>
        {puedeEditar && (
          <Link
            href={`${basePlanificacion}/nuevo`}
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Crear nuevo macrociclo
          </Link>
        )}
      </div>
    );
  }

  const mesesMacro = getMesesDelMacrociclo(macrociclo.fechaInicio, macrociclo.fechaFin);
  const progreso = calcularProgreso(macrociclo.fechaInicio, macrociclo.fechaFin);
  const diasTotal = Math.round(
    (toDate(macrociclo.fechaFin).getTime() - toDate(macrociclo.fechaInicio).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="space-y-6">
      {/* Datos del macrociclo */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Info principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Informacion general
          </p>
          <div className="space-y-2.5">
            <div>
              <p className="text-xs text-gray-500">Nombre</p>
              <p className="text-sm font-semibold text-gray-900">{macrociclo.nombre}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-500">Temporada</p>
                <p className="text-sm font-medium text-gray-900">{macrociclo.temporada}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Equipo</p>
                <p className="text-sm font-medium text-gray-900">{macrociclo.equipo}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-500">Categoria</p>
                <p className="text-sm font-medium text-gray-900">{macrociclo.categoriaObjetivo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <p className="text-sm font-medium text-gray-900">
                  {ESTADO_LABELS[macrociclo.estado] || macrociclo.estado}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Periodo */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Periodo</p>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="text-xs text-gray-500">Inicio</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatFechaLarga(macrociclo.fechaInicio)}
              </p>
            </div>
            <span className="text-gray-300">→</span>
            <div>
              <p className="text-xs text-gray-500">Fin</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatFechaLarga(macrociclo.fechaFin)}
              </p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Duracion</span>
              <span className="font-medium text-gray-700">{diasTotal} dias</span>
            </div>
            <div className="flex justify-between">
              <span>Mesociclos</span>
              <span className="font-medium text-gray-700">{mesociclos.length}</span>
            </div>
          </div>
        </div>

        {/* Objetivos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Objetivos
          </p>
          <div className="space-y-2.5">
            {[macrociclo.objetivo1, macrociclo.objetivo2, macrociclo.objetivo3].map(
              (obj, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700">{obj}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Timeline de mesociclos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
          Timeline del macrociclo
        </p>

        {/* Barra de progreso temporal */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            {mesesMacro.map((mes, i) => (
              <span key={i}>{mes.slice(0, 3)}</span>
            ))}
          </div>
          <div className="h-2 rounded-full bg-gray-100 relative">
            <div
              className="h-2 rounded-full bg-primary/30"
              style={{ width: `${progreso}%` }}
            />
            {progreso > 0 && progreso < 100 && (
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${progreso}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow" />
              </div>
            )}
          </div>
        </div>

        {/* Barras de mesociclos */}
        <div className="space-y-3">
          {mesociclos.map((meso) => {
            const style = ETAPA_STYLES[meso.etapa] || ETAPA_STYLES.PREPARACION_GENERAL;
            const { colStart, colSpan } = getMesocicloColumnas(meso, mesesMacro, macrociclo.fechaInicio);

            return (
              <div
                key={meso.id}
                className="grid gap-0"
                style={{ gridTemplateColumns: `repeat(${mesesMacro.length}, 1fr)` }}
              >
                <Link
                  href={`${basePlanificacion}/mesociclos/${meso.id}`}
                  className={`${style.bg} border ${style.border} rounded-xl p-4 hover:opacity-80 transition-opacity`}
                  style={{ gridColumn: `${colStart} / span ${colSpan}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      <span className={`text-sm font-semibold ${style.text}`}>
                        {ETAPA_LABELS[meso.etapa] || meso.etapa}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatFechaCorta(new Date(meso.fechaInicio))} -{' '}
                      {formatFechaCorta(new Date(meso.fechaFin))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{meso.nombre}</p>
                </Link>
              </div>
            );
          })}

          {mesociclos.length === 0 && (
            <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-400">No hay mesociclos creados</p>
              {puedeEditar && (
                <Link
                  href={`${basePlanificacion}/mesociclos/nuevo?macrocicloId=${macrociclo.id}`}
                  className="text-xs text-primary font-medium mt-1 hover:underline inline-block"
                >
                  + Crear mesociclo
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">Etapas:</span>
          {Object.entries(ETAPA_LABELS).map(([key, label]) => {
            const s = ETAPA_STYLES[key];
            return (
              <span key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className={`w-2 h-2 rounded-full ${s?.dot || 'bg-gray-400'}`} />
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
