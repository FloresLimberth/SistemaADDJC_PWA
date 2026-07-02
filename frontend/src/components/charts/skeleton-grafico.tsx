'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';

interface SkeletonGraficoProps {
  // Altura del area del grafico en px
  altura?: number;
  // Mostrar header con titulo y descripcion
  conHeader?: boolean;
}

export function SkeletonGrafico({
  altura = 320,
  conHeader = true,
}: SkeletonGraficoProps) {
  return (
    <Card>
      {conHeader && (
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
      )}
      <CardContent>
        <div className="flex items-end gap-2" style={{ height: altura }}>
          {/* Barras que imitan un grafico de barras/linea */}
          <Skeleton className="h-[40%] flex-1" />
          <Skeleton className="h-[65%] flex-1" />
          <Skeleton className="h-[50%] flex-1" />
          <Skeleton className="h-[80%] flex-1" />
          <Skeleton className="h-[60%] flex-1" />
          <Skeleton className="h-[45%] flex-1" />
          <Skeleton className="h-[70%] flex-1" />
          <Skeleton className="h-[55%] flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
