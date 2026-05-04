import type { Dolencia } from '@/features/atleta/types/atleta.types';

interface DolenciaCardProps {
  dolencia: Dolencia;
  showRecuperacion?: boolean;
}

// Mapeo de tipoLesion a texto legible
const tipoLesionLabels: Record<string, string> = {
  MOLESTIA: 'Molestia',
  DOLOR_AGUDO: 'Dolor Agudo',
  LESION_CRONICA: 'Lesion Cronica',
  OTRO: 'Otro',
};

// Funcion para formatear fecha
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Funcion para obtener color segun nivel de dolor
function getNivelColor(nivel: number): string {
  if (nivel <= 3) return 'bg-green-500';
  if (nivel <= 5) return 'bg-yellow-500';
  if (nivel <= 7) return 'bg-orange-500';
  return 'bg-red-500';
}

// Tarjeta individual de dolencia
export function DolenciaCard({ dolencia, showRecuperacion = false }: DolenciaCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* Header: Zona y Nivel */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{dolencia.zona}</h3>
          {dolencia.tipoLesion && (
            <span className="text-sm text-muted-foreground">
              {tipoLesionLabels[dolencia.tipoLesion] || dolencia.tipoLesion}
            </span>
          )}
        </div>
        {/* Indicador de nivel */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Nivel:</span>
          <div className="flex items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getNivelColor(dolencia.nivel)}`}
            >
              {dolencia.nivel}
            </div>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
        </div>
      </div>

      {/* Descripcion */}
      {dolencia.descripcion && (
        <p className="text-sm text-muted-foreground mb-3">
          {dolencia.descripcion}
        </p>
      )}

      {/* Metadatos */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-3">
        {/* Fecha de registro */}
        <div>
          <span className="font-medium">Registrada:</span>{' '}
          {formatDate(dolencia.createdAt)}
        </div>

        {/* Sesion relacionada */}
        {dolencia.registroPostEntrenamiento?.sesion && (
          <div>
            <span className="font-medium">Sesion:</span>{' '}
            #{dolencia.registroPostEntrenamiento.sesion.numeroSesion} -{' '}
            {formatDate(dolencia.registroPostEntrenamiento.sesion.fecha)}
          </div>
        )}

        {/* Info de recuperacion (solo si showRecuperacion es true) */}
        {showRecuperacion && dolencia.recuperado && (
          <>
            <div>
              <span className="font-medium">Recuperada:</span>{' '}
              {dolencia.fechaRecuperacion
                ? formatDate(dolencia.fechaRecuperacion)
                : 'Fecha no registrada'}
            </div>
            {dolencia.entrenadorRecuperacion && (
              <div>
                <span className="font-medium">Marcada por:</span>{' '}
                {dolencia.entrenadorRecuperacion.nombreCompleto}
              </div>
            )}
          </>
        )}
      </div>

      {/* Badge de estado */}
      <div className="mt-3">
        {dolencia.recuperado ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Recuperada
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Activa
          </span>
        )}
      </div>
    </div>
  );
}
