'use client';

import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import type { Mesociclo, MicrocicloType } from '@/features/comite-tecnico/types/planificacion.types';

interface CalendarioMicrociclosProps {
  microciclos: MicrocicloType[];
  mesociclos: Mesociclo[];
  basePlanificacion: string;
  baseSesiones: string;
}

const TIPO_MICRO_STYLES: Record<string, string> = {
  CARGA: 'bg-slate-100 text-slate-700 border-slate-200',
  DESCARGA: 'bg-sky-100 text-sky-700 border-sky-200',
  CHOQUE: 'bg-red-100 text-red-700 border-red-200',
  RECUPERACION: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  COMPETITIVO: 'bg-orange-100 text-orange-700 border-orange-200',
};

const TIPO_MICRO_LABELS: Record<string, string> = {
  CARGA: 'Carga',
  DESCARGA: 'Descarga',
  CHOQUE: 'Choque',
  RECUPERACION: 'Recuperacion',
  COMPETITIVO: 'Competitivo',
};

// Colores por tipo de sesion para las cards del grid
const SESION_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  ENTRENAMIENTO: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', label: 'Entrenamiento' },
  TEST: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', label: 'Test' },
  RECUPERACION: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Recuperacion' },
  DESCANSO: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', label: 'Descanso' },
  COMPETENCIA: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'Competencia' },
};

const DIA_LABELS: Record<string, string> = {
  LUNES: 'Lun',
  MARTES: 'Mar',
  MIERCOLES: 'Mie',
  JUEVES: 'Jue',
  VIERNES: 'Vie',
  SABADO: 'Sab',
  DOMINGO: 'Dom',
};

function toDate(fecha: Date | string): Date {
  return typeof fecha === 'string' ? new Date(fecha) : fecha;
}

// Estado temporal del microciclo
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

// Orden de dias para asegurar Lun-Dom
const DIA_ORDEN: Record<string, number> = {
  LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4,
  VIERNES: 5, SABADO: 6, DOMINGO: 7,
};

export function CalendarioMicrociclos({
  microciclos,
  mesociclos,
  basePlanificacion,
  baseSesiones,
}: CalendarioMicrociclosProps) {
  if (microciclos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No hay microciclos disponibles</p>
      </div>
    );
  }

  // Ordenar microciclos por fecha
  const sortedMicros = [...microciclos].sort(
    (a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime(),
  );

  // Encontrar el mesociclo padre de cada microciclo
  const mesoMap = new Map(mesociclos.map((m) => [m.id, m]));

  return (
    <div className="space-y-4">
      {/* Leyenda de tipos de sesion */}
      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span className="font-medium text-gray-400">Tipos de sesion:</span>
        {Object.entries(SESION_STYLES).map(([key, s]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded ${s.bg} border ${s.border}`} />
            {s.label}
          </span>
        ))}
      </div>

      {sortedMicros.map((mc, globalIdx) => {
        const tipoStyle = TIPO_MICRO_STYLES[mc.tipoMicrociclo] || 'bg-gray-100 text-gray-600 border-gray-200';
        const estado = getEstadoTemporal(mc.fechaInicio, mc.fechaFin);
        const sesiones = (mc.sesiones || []).sort(
          (a, b) => (DIA_ORDEN[a.diaSemana] || 0) - (DIA_ORDEN[b.diaSemana] || 0),
        );
        const meso = mc.mesocicloId ? mesoMap.get(mc.mesocicloId) : null;

        return (
          <div key={mc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header del microciclo */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href={`${basePlanificacion}/microciclos/${mc.id}`}
                  className="text-sm font-semibold text-gray-900 hover:underline"
                >
                  Semana {globalIdx + 1}
                  <span className="text-gray-400 font-normal ml-1">
                    ({mc.codigoMicrociclo})
                  </span>
                </Link>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tipoStyle}`}>
                  {TIPO_MICRO_LABELS[mc.tipoMicrociclo] || mc.tipoMicrociclo}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${estado.style}`}>
                  {estado.label}
                </span>
                <span className="text-xs text-gray-400">
                  {formatFechaCorta(new Date(mc.fechaInicio))} -{' '}
                  {formatFechaCorta(new Date(mc.fechaFin))}
                </span>
                {meso && (
                  <span className="text-[10px] text-gray-400">
                    {meso.nombre}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                <span>
                  Vol: <strong className="text-gray-700">{mc.volumenTotal}</strong>
                </span>
                <span>
                  Int: <strong className="text-gray-700">{mc.intensidadPromedio}%</strong>
                </span>
              </div>
            </div>

            {/* Grid semanal 7 columnas */}
            <div className="grid grid-cols-7 divide-x divide-gray-100">
              {sesiones.length > 0 ? (
                sesiones.map((s) => {
                  const sesStyle = SESION_STYLES[s.tipoSesion] || SESION_STYLES.DESCANSO;
                  const dia = new Date(s.fecha);

                  return (
                    <Link
                      key={s.id}
                      href={`${baseSesiones}/${s.id}`}
                      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors min-h-[90px]"
                    >
                      <p className="text-xs font-semibold text-gray-900 mb-1">
                        {DIA_LABELS[s.diaSemana] || s.diaSemana} {dia.getUTCDate()}
                      </p>
                      <div className={`${sesStyle.bg} border ${sesStyle.border} rounded-lg p-2`}>
                        <p className={`text-xs font-medium ${sesStyle.text}`}>
                          {sesStyle.label}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-7 p-6 text-center text-xs text-gray-400">
                  Sin sesiones generadas
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
