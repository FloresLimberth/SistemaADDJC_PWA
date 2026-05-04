import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface AtletaAnalisisData {
  id: string;
  categoriaPeso: string;
  club: string;
  edad: number;
  pesoActual: number | null;
  perfilActual?: string | null;
  usuario: {
    nombreCompleto: string;
  };
  ultimoTest?: {
    fechaTest: Date;
  } | null;
  dolenciasActivasCount?: number;
}

interface AnalisisAtletaCardProps {
  atleta: AtletaAnalisisData;
  href: string;
}

// Formatea MENOS_66K -> "<66 kg", MAS_100K -> ">100 kg"
function formatCategoriaPeso(cat: string): string {
  return cat
    .replace('MENOS_', '<')
    .replace('MAS_', '>')
    .replace('K', ' kg');
}

// Traduce perfil interno a texto legible
const PERFIL_LABELS: Record<string, string> = {
  VELOZ: 'Veloz',
  RESISTENTE: 'Resistente',
  EQUILIBRADO: 'Equilibrado',
  NUEVO: 'Nuevo',
};

// Card de atleta para la lista de analisis
// Muestra datos de preview para que el entrenador decida a quien revisar primero
export function AnalisisAtletaCard({ atleta, href }: AnalisisAtletaCardProps) {
  const dolencias = atleta.dolenciasActivasCount ?? 0;
  const perfil = atleta.perfilActual
    ? PERFIL_LABELS[atleta.perfilActual] || atleta.perfilActual
    : null;

  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all block"
    >
      {/* Fila 1: Nombre + club + categoria peso */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base font-semibold text-gray-900">
            {atleta.usuario.nombreCompleto}
          </p>
          {atleta.club && (
            <p className="text-xs text-gray-500">{atleta.club}</p>
          )}
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0 ml-3">
          {formatCategoriaPeso(atleta.categoriaPeso)}
        </span>
      </div>

      {/* Fila 2: Edad + perfil + ultimo test */}
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span>{atleta.edad} anos</span>

        {perfil && (
          <>
            <span className="text-gray-300">|</span>
            <span>{perfil}</span>
          </>
        )}

        <span className="text-gray-300">|</span>

        {atleta.ultimoTest ? (
          <span>
            Test:{' '}
            {new Date(atleta.ultimoTest.fechaTest).toLocaleDateString('es-BO')}
          </span>
        ) : (
          <span className="text-amber-600">Sin test registrado</span>
        )}
      </div>

      {/* Fila 3: Dolencias activas (solo si hay) */}
      {dolencias > 0 && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            {dolencias} {dolencias === 1 ? 'dolencia activa' : 'dolencias activas'}
          </span>
        </div>
      )}
    </Link>
  );
}
