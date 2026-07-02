// Contenido expandido de una fila de sesion
// Muestra turno, tipoPlanificacion, creadoPor, datos reales vs planificados,
// contenido (fisico/tecnico/tactico) y observaciones

import { Badge } from '@/components/ui/badge';
import type { SesionCompleta } from '@/features/comite-tecnico/actions';
import {
  TURNO_LABELS,
  TIPO_PLANIFICACION_LABELS,
  CREADO_POR_LABELS,
} from './sesion-constants';

interface SesionExpandedRowProps {
  sesion: SesionCompleta;
}

export function SesionExpandedRow({ sesion }: SesionExpandedRowProps) {
  const tieneReales = sesion.volumenReal !== null || sesion.intensidadReal !== null;
  const tieneContenido =
    sesion.contenidoFisico || sesion.contenidoTecnico || sesion.contenidoTactico;

  return (
    <div className="bg-muted/30 px-4 py-3 space-y-3">
      {/* Metadata de la sesion */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Turno: </span>
          <span className="font-medium">
            {TURNO_LABELS[sesion.turno] || sesion.turno}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Planificacion: </span>
          <span className="font-medium">
            {TIPO_PLANIFICACION_LABELS[sesion.tipoPlanificacion] || sesion.tipoPlanificacion}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Creado por: </span>
          <span className="font-medium">
            {CREADO_POR_LABELS[sesion.creadoPor] || sesion.creadoPor}
          </span>
        </div>
        {sesion.aprobado !== undefined && (
          <div>
            <Badge
              variant={sesion.aprobado ? 'default' : 'outline'}
              className={sesion.aprobado ? 'bg-green-600' : ''}
            >
              {sesion.aprobado ? 'Aprobada' : 'Pendiente'}
            </Badge>
          </div>
        )}
      </div>

      {/* Comparacion real vs planificado */}
      {tieneReales && (
        <div className="border rounded-md p-3 bg-background">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Real vs Planificado
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Volumen: </span>
              <span className="font-medium">
                {sesion.volumenReal ?? '--'}
              </span>
              <span className="text-muted-foreground">
                {' '}/ {sesion.volumenPlanificado ?? '--'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Intensidad: </span>
              <span className="font-medium">
                {sesion.intensidadReal !== null ? `${sesion.intensidadReal}%` : '--'}
              </span>
              <span className="text-muted-foreground">
                {' '}/ {sesion.intensidadPlanificada !== null ? `${sesion.intensidadPlanificada}%` : '--'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido: fisico, tecnico, tactico */}
      {tieneContenido && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {sesion.contenidoFisico && (
            <div className="border rounded-md p-3 bg-background">
              <p className="text-xs font-medium text-muted-foreground mb-1">Fisico</p>
              <p>{sesion.contenidoFisico}</p>
            </div>
          )}
          {sesion.contenidoTecnico && (
            <div className="border rounded-md p-3 bg-background">
              <p className="text-xs font-medium text-muted-foreground mb-1">Tecnico</p>
              <p>{sesion.contenidoTecnico}</p>
            </div>
          )}
          {sesion.contenidoTactico && (
            <div className="border rounded-md p-3 bg-background">
              <p className="text-xs font-medium text-muted-foreground mb-1">Tactico</p>
              <p>{sesion.contenidoTactico}</p>
            </div>
          )}
        </div>
      )}

      {/* Observaciones */}
      {sesion.observaciones && (
        <div className="text-sm">
          <span className="text-muted-foreground">Observaciones: </span>
          <span>{sesion.observaciones}</span>
        </div>
      )}
    </div>
  );
}
