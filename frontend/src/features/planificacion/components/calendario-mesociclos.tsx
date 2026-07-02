'use client';

import { Layers } from 'lucide-react';
import Link from 'next/link';
import type { Mesociclo, MicrocicloType } from '@/features/comite-tecnico/types/planificacion.types';

interface CalendarioMesociclosProps {
  mesociclos: Mesociclo[];
  microciclos: MicrocicloType[];
  basePlanificacion: string;
  puedeEditar: boolean;
}

const ETAPA_STYLES: Record<string, { dot: string; text: string; badge: string }> = {
  PREPARACION_GENERAL: { dot: 'bg-slate-600', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  PREPARACION_ESPECIFICA: { dot: 'bg-sky-600', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700 border-sky-200' },
  COMPETITIVA: { dot: 'bg-orange-600', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  TRANSICION: { dot: 'bg-stone-500', text: 'text-stone-600', badge: 'bg-stone-100 text-stone-600 border-stone-200' },
};

const ETAPA_LABELS: Record<string, string> = {
  PREPARACION_GENERAL: 'Prep. General',
  PREPARACION_ESPECIFICA: 'Prep. Especifica',
  COMPETITIVA: 'Competitiva',
  TRANSICION: 'Transicion',
};

const TIPO_MICRO_STYLES: Record<string, string> = {
  CARGA: 'bg-slate-100 text-slate-600',
  DESCARGA: 'bg-sky-100 text-sky-600',
  CHOQUE: 'bg-red-100 text-red-600',
  RECUPERACION: 'bg-emerald-100 text-emerald-600',
  COMPETITIVO: 'bg-orange-100 text-orange-600',
};

const TIPO_MICRO_LABELS: Record<string, string> = {
  CARGA: 'Carga',
  DESCARGA: 'Descarga',
  CHOQUE: 'Choque',
  RECUPERACION: 'Recuperacion',
  COMPETITIVO: 'Competitivo',
};

// Colores de sesion para los mini cuadrados
const SESION_COLORS: Record<string, string> = {
  ENTRENAMIENTO: 'bg-sky-200',
  TEST: 'bg-violet-200',
  RECUPERACION: 'bg-emerald-200',
  DESCANSO: 'bg-gray-200',
  COMPETENCIA: 'bg-orange-200',
};

// Estado temporal del microciclo
function toDate(fecha: Date | string): Date {
  return typeof fecha === 'string' ? new Date(fecha) : fecha;
}

function getEstadoTemporal(fechaInicio: Date | string, fechaFin: Date | string): { label: string; style: string } {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = toDate(fechaInicio);
  inicio.setHours(0, 0, 0, 0);
  const fin = toDate(fechaFin);
  fin.setHours(0, 0, 0, 0);

  if (fin < hoy) return { label: 'Vencido', style: 'bg-gray-100 text-gray-500' };
  if (inicio > hoy) return { label: 'Futuro', style: 'bg-sky-100 text-sky-600' };
  return { label: 'En curso', style: 'bg-emerald-100 text-emerald-600' };
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatFechaCorta(fecha: Date | string): string {
  const d = toDate(fecha);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]?.slice(0, 3) || ''}`;
}

export function CalendarioMesociclos({
  mesociclos,
  microciclos,
  basePlanificacion,
  puedeEditar,
}: CalendarioMesociclosProps) {
  if (mesociclos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Layers className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No hay mesociclos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mesociclos.map((meso) => {
        const style = ETAPA_STYLES[meso.etapa] || ETAPA_STYLES.PREPARACION_GENERAL;
        const microsDelMeso = microciclos
          .filter((mc) => mc.mesocicloId === meso.id)
          .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());

        return (
          <div key={meso.id} className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Header del mesociclo */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                <Link
                  href={`${basePlanificacion}/mesociclos/${meso.id}`}
                  className="text-base font-semibold text-gray-900 hover:underline"
                >
                  {meso.nombre}
                </Link>
                <span className="text-xs text-gray-400">
                  {formatFechaCorta(new Date(meso.fechaInicio))} -{' '}
                  {formatFechaCorta(new Date(meso.fechaFin))}
                </span>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style.badge}`}
              >
                {ETAPA_LABELS[meso.etapa] || meso.etapa}
              </span>
            </div>

            {/* Grid de microciclos */}
            {microsDelMeso.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {microsDelMeso.map((mc, idx) => {
                  const tipoStyle = TIPO_MICRO_STYLES[mc.tipoMicrociclo] || 'bg-gray-100 text-gray-600';
                  const estado = getEstadoTemporal(mc.fechaInicio, mc.fechaFin);
                  const sesiones = mc.sesiones || [];

                  return (
                    <Link
                      key={mc.id}
                      href={`${basePlanificacion}/microciclos/${mc.id}`}
                      className="border border-gray-200 rounded-xl p-3 hover:border-gray-400 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">
                          Sem {idx + 1}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tipoStyle}`}>
                          {TIPO_MICRO_LABELS[mc.tipoMicrociclo] || mc.tipoMicrociclo}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mb-1">
                        {formatFechaCorta(new Date(mc.fechaInicio))} -{' '}
                        {formatFechaCorta(new Date(mc.fechaFin))}
                      </p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${estado.style} inline-block mb-2`}>
                        {estado.label}
                      </span>
                      {/* Mini preview de sesiones (7 cuadraditos) */}
                      {sesiones.length > 0 && (
                        <div className="flex gap-0.5">
                          {sesiones.map((s) => (
                            <div
                              key={s.id}
                              className={`w-3 h-3 rounded-sm ${SESION_COLORS[s.tipoSesion] || 'bg-gray-200'}`}
                              title={s.tipoSesion}
                            />
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400">Sin microciclos asignados</p>
                {puedeEditar && (
                  <Link
                    href={`${basePlanificacion}/microciclos/nuevo?mesocicloId=${meso.id}`}
                    className="text-xs text-primary font-medium mt-1 hover:underline inline-block"
                  >
                    + Crear microciclo
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
