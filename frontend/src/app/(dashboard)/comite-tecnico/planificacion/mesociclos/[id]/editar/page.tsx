import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchMesociclo } from '@/features/comite-tecnico/actions';
import { EditMesocicloForm } from '@/features/comite-tecnico/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EditarMesocicloPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMesocicloPage({ params }: EditarMesocicloPageProps) {
  const { id } = await params;

  const mesociclo = await fetchMesociclo(id);

  if (!mesociclo) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/comite-tecnico/planificacion/mesociclos/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Mesociclo</h1>
          <p className="text-muted-foreground">Modifica los datos de {mesociclo.nombre}</p>
        </div>
      </div>

      <EditMesocicloForm mesociclo={mesociclo} />
    </div>
  );
}
