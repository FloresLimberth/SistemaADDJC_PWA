'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RankingFilters } from './ranking-filters';
import { RankingTable } from './ranking-table';
import { fetchRankingCategoria } from '../actions/fetch-ranking';
import type { RankingCategoria } from '../types/algoritmo.types';

const CATEGORIA_LABELS: Record<string, string> = {
  MENOS_60K: 'Menos de 60 kg',
  MENOS_66K: 'Menos de 66 kg',
  MENOS_73K: 'Menos de 73 kg',
  MENOS_81K: 'Menos de 81 kg',
  MENOS_90K: 'Menos de 90 kg',
  MENOS_100K: 'Menos de 100 kg',
  MAS_100K: 'Mas de 100 kg',
};

interface RankingCategoryViewProps {
  categoriaInicial: string;
  dataInicial: RankingCategoria | null;
  atletaDetalleBaseHref?: string;
}

// Vista de ranking por categoria con selector y tabla
// Usado por CT y ENT
export function RankingCategoryView({
  categoriaInicial,
  dataInicial,
  atletaDetalleBaseHref,
}: RankingCategoryViewProps) {
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [data, setData] = useState<RankingCategoria | null>(dataInicial);
  const [isPending, startTransition] = useTransition();

  function handleCategoriaChange(nuevaCategoria: string) {
    setCategoria(nuevaCategoria);
    startTransition(async () => {
      const resultado = await fetchRankingCategoria(nuevaCategoria);
      setData(resultado);
    });
  }

  return (
    <div className="space-y-4">
      <RankingFilters
        categoriaSeleccionada={categoria}
        onCategoriaChange={handleCategoriaChange}
      />

      {isPending && (
        <p className="text-sm text-muted-foreground">Cargando ranking...</p>
      )}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ranking - {CATEGORIA_LABELS[data.categoriaPeso] || data.categoriaPeso}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {data.totalAtletas} atletas evaluados
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{data.resumen}</p>
          </CardHeader>
          <CardContent>
            <RankingTable
              ranking={data.ranking}
              atletaDetalleBaseHref={atletaDetalleBaseHref}
            />
          </CardContent>
        </Card>
      )}

      {!data && !isPending && (
        <p className="text-center text-muted-foreground py-8">
          No se pudo cargar el ranking para esta categoria.
        </p>
      )}
    </div>
  );
}
