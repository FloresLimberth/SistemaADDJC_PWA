'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecomendacionBadge, PrioridadBadge } from './recomendacion-badge';
import type { Recomendacion, HistorialRecomendacion } from '../types/algoritmo.types';

interface RecomendacionDetailProps {
  recomendacion: Recomendacion;
  historial?: HistorialRecomendacion[];
}

// Nombres legibles para tipo de recomendacion
const TIPO_LABELS: Record<string, string> = {
  INICIAL: 'Inicial',
  AJUSTE_POST_TEST: 'Ajuste post-test',
  ALERTA_FATIGA: 'Alerta de fatiga',
  AJUSTE_LESION: 'Ajuste por lesion',
  ALERTA_DESVIACION_CARGA: 'Desviacion de carga',
  PERSONALIZACION_TACTICA: 'Personalizacion tactica',
  NUTRICIONAL: 'Nutricional',
  AJUSTE_PLANIFICACION: 'Ajuste de planificacion',
};

export function RecomendacionDetail({
  recomendacion,
  historial,
}: RecomendacionDetailProps) {
  return (
    <div className="space-y-4">
      {/* Informacion principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <RecomendacionBadge estado={recomendacion.estado} />
            <PrioridadBadge prioridad={recomendacion.prioridad} />
            <Badge variant="outline">
              {TIPO_LABELS[recomendacion.tipo] || recomendacion.tipo}
            </Badge>
          </div>
          <CardTitle className="mt-2">{recomendacion.titulo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mensaje</p>
            <p className="text-sm mt-1">{recomendacion.mensaje}</p>
          </div>

          {recomendacion.accionSugerida && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Accion sugerida
              </p>
              <p className="text-sm mt-1">{recomendacion.accionSugerida}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {recomendacion.atleta && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atleta</p>
                <p className="text-sm">{recomendacion.atleta.nombreCompleto}</p>
              </div>
            )}
            {recomendacion.microcicloAfectado && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Microciclo afectado
                </p>
                <p className="text-sm">
                  {recomendacion.microcicloAfectado.codigoMicrociclo} (
                  {recomendacion.microcicloAfectado.tipoMicrociclo})
                </p>
              </div>
            )}
            {recomendacion.sesionGenerada && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sesion generada
                </p>
                <p className="text-sm">
                  {new Date(recomendacion.sesionGenerada.fecha).toLocaleDateString('es-BO')}
                  {' - '}
                  {recomendacion.sesionGenerada.tipoSesion}
                  {recomendacion.sesionGenerada.aprobado ? ' (Aprobada)' : ' (Pendiente)'}
                </p>
              </div>
            )}
            {recomendacion.revisor && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revisor</p>
                <p className="text-sm">{recomendacion.revisor}</p>
              </div>
            )}
            {recomendacion.aplicador && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aplicador</p>
                <p className="text-sm">{recomendacion.aplicador}</p>
              </div>
            )}
          </div>

          {recomendacion.comentarioRevision && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Comentario de revision
              </p>
              <p className="text-sm mt-1">{recomendacion.comentarioRevision}</p>
            </div>
          )}

          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>
              Creada: {new Date(recomendacion.createdAt).toLocaleDateString('es-BO')}
            </span>
            {recomendacion.fechaRevision && (
              <span>
                Revisada: {new Date(recomendacion.fechaRevision).toLocaleDateString('es-BO')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historial (Audit Trail) */}
      {historial && historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de cambios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historial.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-l-2 border-muted pl-4 pb-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.accion}</span>
                      {item.estadoAnterior && (
                        <span className="text-xs text-muted-foreground">
                          {item.estadoAnterior} → {item.estadoNuevo}
                        </span>
                      )}
                    </div>
                    {item.comentario && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.comentario}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.usuario} -{' '}
                      {new Date(item.fecha).toLocaleDateString('es-BO')}{' '}
                      {new Date(item.fecha).toLocaleTimeString('es-BO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
