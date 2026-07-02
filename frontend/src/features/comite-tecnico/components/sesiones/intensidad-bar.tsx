// Barra de intensidad con color segun el valor
// Verde (<40%), Amarillo (40-59%), Naranja (60-79%), Rojo (80%+)

interface IntensidadBarProps {
  valor: number | null;
}

function getColorClass(valor: number): string {
  if (valor < 40) return 'bg-green-500';
  if (valor < 60) return 'bg-yellow-500';
  if (valor < 80) return 'bg-orange-500';
  return 'bg-red-500';
}

export function IntensidadBar({ valor }: IntensidadBarProps) {
  if (valor === null || valor === undefined) {
    return <span className="text-muted-foreground">--</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${getColorClass(valor)}`}
          style={{ width: `${Math.min(valor, 100)}%` }}
        />
      </div>
      <span className="text-sm tabular-nums">{valor}%</span>
    </div>
  );
}
