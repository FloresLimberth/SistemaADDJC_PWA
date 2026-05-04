'use client';

import { Badge } from '@/components/ui/badge';

interface RecomendacionBadgeProps {
  estado: string;
}

// Badge de estado para recomendaciones
// PENDIENTE=amarillo, EN_PROCESO=azul, CUMPLIDA=verde, RECHAZADA=rojo, MODIFICADA=morado
export function RecomendacionBadge({ estado }: RecomendacionBadgeProps) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDIENTE: { label: 'Pendiente', variant: 'outline' },
    EN_PROCESO: { label: 'En proceso', variant: 'secondary' },
    CUMPLIDA: { label: 'Aprobada', variant: 'default' },
    RECHAZADA: { label: 'Rechazada', variant: 'destructive' },
    MODIFICADA: { label: 'Modificada', variant: 'secondary' },
  };

  const { label, variant } = config[estado] || { label: estado, variant: 'outline' as const };

  return <Badge variant={variant}>{label}</Badge>;
}

interface PrioridadBadgeProps {
  prioridad: string;
}

// Badge de prioridad
export function PrioridadBadge({ prioridad }: PrioridadBadgeProps) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    CRITICA: { variant: 'destructive' },
    ALTA: { variant: 'destructive' },
    MEDIA: { variant: 'secondary' },
    BAJA: { variant: 'outline' },
  };

  const { variant } = config[prioridad] || { variant: 'outline' as const };

  return <Badge variant={variant}>{prioridad}</Badge>;
}
