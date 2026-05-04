'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import type { RankingAtleta } from '../types/algoritmo.types';

interface RankingTableProps {
  ranking: RankingAtleta[];
  atletaDetalleBaseHref?: string;
}

// Variante del badge segun aptoPara
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

// Label legible para aptoPara
function getAptoLabel(aptoPara: string): string {
  switch (aptoPara) {
    case 'COMPETIR':
      return 'Apto';
    case 'RESERVA':
      return 'Reserva';
    case 'NO_APTO':
      return 'No apto';
    default:
      return aptoPara;
  }
}

export function RankingTable({ ranking, atletaDetalleBaseHref }: RankingTableProps) {
  if (ranking.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay atletas en esta categoria para mostrar ranking.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Atleta</TableHead>
          <TableHead className="text-right">Puntuacion</TableHead>
          <TableHead className="text-right">Fuerza</TableHead>
          <TableHead className="text-right">Resistencia</TableHead>
          <TableHead className="text-right">Estado</TableHead>
          <TableHead className="text-right">Peso</TableHead>
          <TableHead>Aptitud</TableHead>
          <TableHead>Alertas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ranking.map((atleta) => (
          <TableRow key={atleta.atletaId}>
            <TableCell className="font-bold">{atleta.posicion}</TableCell>
            <TableCell>
              {atletaDetalleBaseHref ? (
                <Link
                  href={`${atletaDetalleBaseHref}/${atleta.atletaId}`}
                  className="text-primary hover:underline"
                >
                  {atleta.nombreCompleto}
                </Link>
              ) : (
                atleta.nombreCompleto
              )}
            </TableCell>
            <TableCell className="text-right font-mono font-bold">
              {atleta.puntuacion.toFixed(1)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {atleta.score.scoreFuerza.toFixed(1)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {atleta.score.scoreResistencia.toFixed(1)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {atleta.score.scoreEstado.toFixed(1)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {atleta.score.scorePeso.toFixed(1)}
            </TableCell>
            <TableCell>
              <Badge variant={getAptoVariant(atleta.aptoPara)}>
                {getAptoLabel(atleta.aptoPara)}
              </Badge>
            </TableCell>
            <TableCell>
              {atleta.alertas.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {atleta.alertas.length} alerta{atleta.alertas.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
