'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RankingIndividual } from '../types/algoritmo.types';

interface RankingAthleteCardProps {
  ranking: RankingIndividual;
}

// Nombres legibles para categorias
const CATEGORIA_LABELS: Record<string, string> = {
  MENOS_60K: 'Menos de 60 kg',
  MENOS_66K: 'Menos de 66 kg',
  MENOS_73K: 'Menos de 73 kg',
  MENOS_81K: 'Menos de 81 kg',
  MENOS_90K: 'Menos de 90 kg',
  MENOS_100K: 'Menos de 100 kg',
  MAS_100K: 'Mas de 100 kg',
};

function getAptoVariant(aptoPara: string) {
  switch (aptoPara) {
    case 'COMPETIR':
      return 'default';
    case 'RESERVA':
      return 'secondary';
    case 'NO_APTO':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getAptoLabel(aptoPara: string): string {
  switch (aptoPara) {
    case 'COMPETIR':
      return 'Apto para competir';
    case 'RESERVA':
      return 'Reserva';
    case 'NO_APTO':
      return 'No apto';
    default:
      return aptoPara;
  }
}

export function RankingAthleteCard({ ranking }: RankingAthleteCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{ranking.atleta.nombreCompleto}</span>
          <Badge variant={getAptoVariant(ranking.aptoPara)}>
            {getAptoLabel(ranking.aptoPara)}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {CATEGORIA_LABELS[ranking.atleta.categoriaPeso] || ranking.atleta.categoriaPeso}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Posicion</p>
            <p className="text-2xl font-bold">
              {ranking.posicion !== null
                ? `${ranking.posicion} / ${ranking.totalEnCategoria}`
                : 'Sin datos'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Puntuacion total</p>
            <p className="text-2xl font-bold">{ranking.puntuacion.toFixed(1)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Fuerza (25%)</p>
            <p className="font-mono font-medium">
              {ranking.score.scoreFuerza.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Resistencia (25%)</p>
            <p className="font-mono font-medium">
              {ranking.score.scoreResistencia.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado (30%)</p>
            <p className="font-mono font-medium">
              {ranking.score.scoreEstado.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Peso (20%)</p>
            <p className="font-mono font-medium">
              {ranking.score.scorePeso.toFixed(1)}
            </p>
          </div>
        </div>

        {ranking.alertas.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1">Alertas</p>
            <div className="space-y-1">
              {ranking.alertas.map((alerta, i) => (
                <p key={i} className="text-sm text-destructive">
                  {alerta}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-1">Justificacion</p>
          <p className="text-sm">{ranking.justificacion}</p>
        </div>
      </CardContent>
    </Card>
  );
}
