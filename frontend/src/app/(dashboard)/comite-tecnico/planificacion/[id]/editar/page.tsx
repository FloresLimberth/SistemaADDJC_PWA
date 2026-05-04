import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchMacrociclo } from '@/features/comite-tecnico/actions';
import { EditMacrocicloForm } from '@/features/comite-tecnico/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EditarMacrocicloPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMacrocicloPage({ params }: EditarMacrocicloPageProps) {
  const { id } = await params;

  const macrociclo = await fetchMacrociclo(id);

  if (!macrociclo) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/comite-tecnico/planificacion/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Macrociclo</h1>
          <p className="text-muted-foreground">Modifica los datos de {macrociclo.nombre}</p>
        </div>
      </div>

      <EditMacrocicloForm macrociclo={macrociclo} />
    </div>
  );
}
