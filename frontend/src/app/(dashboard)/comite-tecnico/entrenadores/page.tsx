import { fetchEntrenadores } from '@/features/comite-tecnico/actions';
import { EntrenadoresList } from '@/features/comite-tecnico/components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCog, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

export default async function EntrenadoresPage() {
  const result = await fetchEntrenadores({ limit: 50 });

  const entrenadores = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entrenadores</h1>
          <p className="text-muted-foreground">
            {total} entrenador{total !== 1 ? 'es' : ''} en el sistema
          </p>
        </div>
        <Button asChild>
          <Link href={COMITE_TECNICO_ROUTES.entrenadores.nuevo}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Entrenador
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Lista de Entrenadores
          </CardTitle>
          <CardDescription>
            Todos los entrenadores registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntrenadoresList entrenadores={entrenadores} />
        </CardContent>
      </Card>
    </div>
  );
}
