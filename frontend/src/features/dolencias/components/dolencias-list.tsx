import type { Dolencia } from '@/features/atleta/types/atleta.types';
import { DolenciaCard } from './dolencia-card';

interface DolenciasListProps {
  dolencias: Dolencia[];
  showRecuperacion?: boolean;
}

// Lista de dolencias
export function DolenciasList({ dolencias, showRecuperacion = false }: DolenciasListProps) {
  return (
    <div className="space-y-4">
      {dolencias.map((dolencia) => (
        <DolenciaCard
          key={dolencia.id}
          dolencia={dolencia}
          showRecuperacion={showRecuperacion}
        />
      ))}
    </div>
  );
}
