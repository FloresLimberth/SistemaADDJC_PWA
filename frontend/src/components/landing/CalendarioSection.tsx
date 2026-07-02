import {
  fetchPlanificacionPublica,
  type PlanificacionPublica,
} from './fetch-planificacion-publica';

// Colores por etapa de mesociclo (tonalidades serias, no pastel)
const ETAPA_STYLES: Record<
  string,
  { bg: string; border: string; dot: string; text: string }
> = {
  PREPARACION_GENERAL: {
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    dot: 'bg-slate-600',
    text: 'text-slate-700',
  },
  PREPARACION_ESPECIFICA: {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    dot: 'bg-sky-600',
    text: 'text-sky-700',
  },
  COMPETITIVA: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    dot: 'bg-orange-600',
    text: 'text-orange-700',
  },
  TRANSICION: {
    bg: 'bg-stone-50',
    border: 'border-stone-300',
    dot: 'bg-stone-500',
    text: 'text-stone-600',
  },
};

// Nombres legibles de etapas
const ETAPA_LABELS: Record<string, string> = {
  PREPARACION_GENERAL: 'Prep. General',
  PREPARACION_ESPECIFICA: 'Prep. Especifica',
  COMPETITIVA: 'Competitiva',
  TRANSICION: 'Transicion',
};

// Nombres de meses en espanol
const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function formatFechaCorta(fecha: string): string {
  const d = new Date(fecha);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]?.slice(0, 3) || ''}`;
}

// Calcula cuantos meses abarca el macrociclo para generar las columnas
function getMesesDelMacrociclo(
  fechaInicio: string,
  fechaFin: string,
): { mes: number; anio: number; nombre: string }[] {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const meses: { mes: number; anio: number; nombre: string }[] = [];

  let current = new Date(
    Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), 1),
  );
  const finMes = new Date(
    Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth(), 1),
  );

  while (current <= finMes) {
    meses.push({
      mes: current.getUTCMonth(),
      anio: current.getUTCFullYear(),
      nombre: MESES[current.getUTCMonth()] || '',
    });
    current = new Date(
      Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1),
    );
  }

  return meses;
}

// Calcula en que columna empieza y termina un mesociclo
function getMesocicloColumnas(
  mesociclo: { fechaInicio: string; fechaFin: string },
  mesesMacro: { mes: number; anio: number }[],
): { colStart: number; colSpan: number } {
  const inicio = new Date(mesociclo.fechaInicio);
  const fin = new Date(mesociclo.fechaFin);

  const mesInicio = mesesMacro.findIndex(
    (m) =>
      m.mes === inicio.getUTCMonth() && m.anio === inicio.getUTCFullYear(),
  );
  const mesFin = mesesMacro.findIndex(
    (m) => m.mes === fin.getUTCMonth() && m.anio === fin.getUTCFullYear(),
  );

  if (mesInicio === -1 || mesFin === -1) {
    return { colStart: 1, colSpan: 1 };
  }

  return {
    colStart: mesInicio + 1,
    colSpan: mesFin - mesInicio + 1,
  };
}

// Componente del calendario publico para la landing page
export async function CalendarioSection() {
  const data: PlanificacionPublica = await fetchPlanificacionPublica();

  if (!data.macrociclo || data.mesociclos.length === 0) {
    return null;
  }

  const mesesMacro = getMesesDelMacrociclo(
    data.macrociclo.fechaInicio,
    data.macrociclo.fechaFin,
  );

  return (
    <section id="calendario" className="bg-white py-20">
      <div className="container mx-auto px-8 lg:px-16">
        {/* Titulo */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-secondary tracking-tight">
            Calendario de Entrenamiento
          </h2>
          <p className="text-gray-500 mt-2">
            {data.macrociclo.nombre} &middot; Temporada{' '}
            {data.macrociclo.temporada}
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 lg:p-8">
          {/* Header de meses */}
          <div
            className="grid gap-0 mb-4"
            style={{
              gridTemplateColumns: `repeat(${mesesMacro.length}, 1fr)`,
            }}
          >
            {mesesMacro.map((m, i) => (
              <div
                key={`${m.anio}-${m.mes}`}
                className={`text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 ${
                  i > 0 ? 'border-l border-gray-200' : ''
                }`}
              >
                {m.nombre}
              </div>
            ))}
          </div>

          {/* Barras de mesociclos */}
          <div className="space-y-3">
            {data.mesociclos.map((meso, i) => {
              const style =
                ETAPA_STYLES[meso.etapa] || ETAPA_STYLES.PREPARACION_GENERAL;
              const { colStart, colSpan } = getMesocicloColumnas(
                meso,
                mesesMacro,
              );

              return (
                <div
                  key={i}
                  className="grid gap-0"
                  style={{
                    gridTemplateColumns: `repeat(${mesesMacro.length}, 1fr)`,
                  }}
                >
                  <div
                    className={`${style.bg} border ${style.border} rounded-xl p-4`}
                    style={{
                      gridColumn: `${colStart} / span ${colSpan}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${style.dot}`}
                        />
                        <span
                          className={`text-sm font-semibold ${style.text}`}
                        >
                          {ETAPA_LABELS[meso.etapa] || meso.etapa}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatFechaCorta(meso.fechaInicio)} -{' '}
                        {formatFechaCorta(meso.fechaFin)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{meso.nombre}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-400 font-medium">Etapas:</span>
            {Object.entries(ETAPA_LABELS).map(([key, label]) => {
              const style = ETAPA_STYLES[key];
              return (
                <span
                  key={key}
                  className="flex items-center gap-1.5 text-xs text-gray-600"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${style?.dot || 'bg-gray-400'}`}
                  />
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
