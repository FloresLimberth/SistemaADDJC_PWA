import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchAtleta, fetchEntrenadores } from '@/features/comite-tecnico/actions';
import { EditAtletaForm } from '@/features/comite-tecnico/components/forms';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EditAtletaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAtletaPage({ params }: EditAtletaPageProps) {
  const { id } = await params;

  // Obtener datos del atleta y lista de entrenadores en paralelo
  const [atleta, entrenadoresResult] = await Promise.all([
    fetchAtleta(id),
    fetchEntrenadores({ limit: 100 }),
  ]);

  if (!atleta) {
    notFound();
  }

  // Mapear entrenadores al formato esperado por el form
  const entrenadores = (entrenadoresResult?.data || []).map((ent) => ({
    id: ent.id,
    nombreCompleto: ent.usuario.nombreCompleto,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/comite-tecnico/atletas/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Atleta</h1>
          <p className="text-muted-foreground">
            Modificando: {atleta.usuario.nombreCompleto}
          </p>
        </div>
      </div>

      <EditAtletaForm atleta={atleta} entrenadores={entrenadores} />
    </div>
  );
}
