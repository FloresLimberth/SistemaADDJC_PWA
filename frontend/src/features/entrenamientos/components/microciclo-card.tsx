import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Microciclo } from '../types/planificacion.types';
import { formatDateShort, formatDateMedium } from '@/lib/date-utils';

interface MicrocicloCardProps {
  microciclo: Microciclo;
}

export function MicrocicloCard({ microciclo }: MicrocicloCardProps) {

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Microciclo {microciclo.codigoMicrociclo}
          </CardTitle>
          <Badge variant="outline">{microciclo.tipoMicrociclo}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDateShort(microciclo.fechaInicio)} - {formatDateMedium(microciclo.fechaFin)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Objetivo Semanal */}
        <div>
          <h4 className="text-sm font-medium mb-1">Objetivo:</h4>
          <p className="text-sm text-muted-foreground">{microciclo.objetivoSemanal}</p>
        </div>

        {/* Cargas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Volumen</p>
            <p className="text-lg font-semibold">{microciclo.volumenTotal}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Intensidad</p>
            <p className="text-lg font-semibold">{microciclo.intensidadPromedio}%</p>
          </div>
        </div>

        {/* Sesiones */}
        {microciclo.sesiones && microciclo.sesiones.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Sesiones ({microciclo.sesiones.length})</h4>
            <div className="space-y-2">
              {microciclo.sesiones.map((sesion) => (
                <Link
                  key={sesion.id}
                  href={`/atleta/planificacion/sesion/${sesion.id}`}
                  className="block p-2 rounded-md border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{sesion.diaSemana}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateShort(sesion.fecha)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {sesion.tipoSesion}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mesociclo (si existe) */}
        {microciclo.mesociclo && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Pertenece a: <span className="font-medium">{microciclo.mesociclo.nombre}</span> ({microciclo.mesociclo.etapa})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
