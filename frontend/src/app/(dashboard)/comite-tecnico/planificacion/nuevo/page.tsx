import { CreateMacrocicloForm } from '@/features/comite-tecnico/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NuevoMacrocicloPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/comite-tecnico/planificacion">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Macrociclo</h1>
          <p className="text-muted-foreground">Crea un nuevo plan de entrenamiento a largo plazo</p>
        </div>
      </div>

      <CreateMacrocicloForm />
    </div>
  );
}
