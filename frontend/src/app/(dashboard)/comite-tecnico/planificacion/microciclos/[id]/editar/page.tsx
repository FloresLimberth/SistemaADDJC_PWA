import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchMicrociclo } from '@/features/comite-tecnico/actions';
import { EditMicrocicloForm } from '@/features/comite-tecnico/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EditarMicrocicloPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMicrocicloPage({ params }: EditarMicrocicloPageProps) {
  const { id } = await params;

  const microciclo = await fetchMicrociclo(id);

  if (!microciclo) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/comite-tecnico/planificacion/microciclos/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Microciclo</h1>
          <p className="text-muted-foreground">
            Modifica los datos del Microciclo #{microciclo.codigoMicrociclo}
          </p>
        </div>
      </div>

      <EditMicrocicloForm microciclo={microciclo} />
    </div>
  );
}
