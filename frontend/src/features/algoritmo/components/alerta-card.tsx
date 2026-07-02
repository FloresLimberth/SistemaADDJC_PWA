'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { AlertaDestinatario } from '../types/algoritmo.types';

interface AlertaCardProps {
  alerta: AlertaDestinatario;
  onMarcarLeida?: (alertaDestinatarioId: string) => void;
  isPending?: boolean;
}

function getSeveridadVariant(severidad: string) {
  switch (severidad) {
    case 'CRITICA':
      return 'destructive';
    case 'ALTA':
      return 'destructive';
    case 'MEDIA':
      return 'secondary';
    case 'BAJA':
      return 'outline';
    default:
      return 'outline';
  }
}

const TIPO_ALERTA_LABELS: Record<string, string> = {
  BAJO_RENDIMIENTO: 'Bajo rendimiento',
  PESO_FUERA_RANGO: 'Peso fuera de rango',
  LESION_DETECTADA: 'Lesion detectada',
  TEST_FALLIDO: 'Test fallido',
  FATIGA_ALTA: 'Fatiga alta',
  DESVIACION_CARGA: 'Desviacion de carga',
};

// Card individual de alerta
export function AlertaCard({ alerta, onMarcarLeida, isPending }: AlertaCardProps) {
  return (
    <Card className={alerta.leida ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={getSeveridadVariant(alerta.severidad)}>
              {alerta.severidad}
            </Badge>
            <Badge variant="outline">
              {TIPO_ALERTA_LABELS[alerta.tipo] || alerta.tipo}
            </Badge>
          </div>
          {!alerta.leida && onMarcarLeida && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarcarLeida(alerta.id)}
              disabled={isPending}
            >
              <Eye className="h-4 w-4 mr-1" />
              Marcar leida
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium mb-1">{alerta.titulo}</h4>
        <p className="text-sm text-muted-foreground mb-2">
          {alerta.descripcion}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Atleta: {alerta.atletaNombre}</span>
          <span>Ocurrencias: {alerta.ocurrencias}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span>
            Ultima: {new Date(alerta.ultimaOcurrencia).toLocaleDateString('es-BO')}
          </span>
          <span>
            Creada: {new Date(alerta.createdAt).toLocaleDateString('es-BO')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
