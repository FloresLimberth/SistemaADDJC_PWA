'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoriaPesoValues } from '@/types/enums';

interface RankingFiltersProps {
  categoriaSeleccionada: string;
  onCategoriaChange: (categoria: string) => void;
}

// Nombres legibles para categorias de peso
const CATEGORIA_LABELS: Record<string, string> = {
  MENOS_60K: 'Menos de 60 kg',
  MENOS_66K: 'Menos de 66 kg',
  MENOS_73K: 'Menos de 73 kg',
  MENOS_81K: 'Menos de 81 kg',
  MENOS_90K: 'Menos de 90 kg',
  MENOS_100K: 'Menos de 100 kg',
  MAS_100K: 'Mas de 100 kg',
};

export function RankingFilters({
  categoriaSeleccionada,
  onCategoriaChange,
}: RankingFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium">Categoria de peso:</label>
      <Select
        value={categoriaSeleccionada}
        onValueChange={onCategoriaChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar categoria" />
        </SelectTrigger>
        <SelectContent>
          {CategoriaPesoValues.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {CATEGORIA_LABELS[cat] || cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
