'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  createdAt: string;
  leida: boolean;
}

interface NotificacionesRecentesListProps {
  notificaciones: Notificacion[];
}

// Mapa de variantes de badge segun prioridad
const prioridadVariants = {
  BAJA: 'secondary' as const,
  MEDIA: 'default' as const,
  ALTA: 'destructive' as const,
  CRITICA: 'destructive' as const,
};

// Componente para mostrar las ultimas 3 notificaciones
export function NotificacionesRecentesList({ notificaciones }: NotificacionesRecentesListProps) {
  if (notificaciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Recientes
          </CardTitle>
          <CardDescription>Ultimas recomendaciones y alertas del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No tienes notificaciones pendientes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones Recientes
        </CardTitle>
        <CardDescription>Ultimas recomendaciones y alertas del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificaciones.map((notificacion) => (
          <div
            key={notificacion.id}
            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{notificacion.titulo}</p>
                <Badge variant={prioridadVariants[notificacion.prioridad]} className="text-xs">
                  {notificacion.prioridad}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notificacion.mensaje}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notificacion.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Link para ver todas las notificaciones */}
        <Link
          href="/atleta/notificaciones"
          className="block text-sm text-primary hover:underline text-center pt-2"
        >
          Ver todas las notificaciones
        </Link>
      </CardContent>
    </Card>
  );
}
