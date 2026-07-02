'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Loader2 } from 'lucide-react';
import {
  PERIODOS_ANALISIS,
  PERIODO_DEFAULT,
} from '@/features/algoritmo/lib/periodo-analisis';

// Selector de período para las páginas de análisis de rendimiento
// Actualiza el query param ?dias=N para que el Server Component padre
// re-haga el fetch con el nuevo rango
export function SelectorPeriodoAnalisis() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const valorActual = searchParams.get('dias') || PERIODO_DEFAULT;
  // Si el valor del URL no es uno válido, mostramos el default en la UI
  const valorMostrado = PERIODOS_ANALISIS.some((p) => p.valor === valorActual)
    ? valorActual
    : PERIODO_DEFAULT;

  const handleChange = useCallback(
    (nuevoValor: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nuevoValor === PERIODO_DEFAULT) {
        params.delete('dias');
      } else {
        params.set('dias', nuevoValor);
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [searchParams, pathname, router]
  );

  return (
    <div className="flex items-center gap-2">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Calendar className="h-4 w-4 text-muted-foreground" />
      )}
      <Select value={valorMostrado} onValueChange={handleChange}>
        <SelectTrigger className="h-9 w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODOS_ANALISIS.map((p) => (
            <SelectItem key={p.valor} value={p.valor}>
              {p.etiqueta}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
