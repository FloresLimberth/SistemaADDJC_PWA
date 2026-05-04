import Link from 'next/link';
import { fetchAtletas } from '@/features/comite-tecnico/actions';
import { AtletasListCT } from '@/features/comite-tecnico/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

export default async function AtletasPage() {
  const result = await fetchAtletas({ limit: 50 });

  const atletas = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Atletas</h1>
          <p className="text-muted-foreground">
            {total} atleta{total !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/comite-tecnico/atletas/nuevo">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Atleta
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Atletas
          </CardTitle>
          <CardDescription>
            Todos los atletas registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AtletasListCT atletas={atletas} />
        </CardContent>
      </Card>
    </div>
  );
}
