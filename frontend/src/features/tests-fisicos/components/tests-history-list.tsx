'use client';

import { TestHistoryCard } from './test-history-card';

interface TestsHistoryListProps {
  tests: any[]; // Tipo any por ahora
}

// Componente para mostrar la lista completa de tests
export function TestsHistoryList({ tests }: TestsHistoryListProps) {
  if (!tests || tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground mb-2">
          No hay tests fisicos registrados
        </p>
        <p className="text-sm text-muted-foreground">
          Tu entrenador registrara los tests cuando los realices
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Historial de Tests Fisicos</h2>
        <p className="text-sm text-muted-foreground">{tests.length} tests registrados</p>
      </div>

      <div className="grid gap-4">
        {tests.map((test) => (
          <TestHistoryCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  );
}
