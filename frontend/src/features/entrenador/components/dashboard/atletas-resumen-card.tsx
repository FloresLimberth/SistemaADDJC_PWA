import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AtletaResumen } from '../../types/entrenador.types';
import { Users, ArrowRight, AlertTriangle } from 'lucide-react';

interface AtletasResumenCardProps {
  atletas: AtletaResumen[];
  maxMostrar?: number;
}

// Muestra un resumen de los atletas asignados al entrenador
export function AtletasResumenCard({ atletas, maxMostrar = 5 }: AtletasResumenCardProps) {
  const atletasMostrados = atletas.slice(0, maxMostrar);
  const hayMas = atletas.length > maxMostrar;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mis Atletas
          </CardTitle>
          <CardDescription>
            {atletas.length} atleta{atletas.length !== 1 ? 's' : ''} asignado{atletas.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/entrenador/mis-atletas">
            Ver todos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {atletas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tienes atletas asignados
          </p>
        ) : (
          <ul className="space-y-3">
            {atletasMostrados.map((atleta) => (
              <li key={atleta.id}>
                <Link
                  href={`/entrenador/mis-atletas/${atleta.id}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{atleta.usuario.nombreCompleto}</span>
                    <span className="text-xs text-muted-foreground">
                      {atleta.categoriaPeso?.replace(/_/g, ' ') || 'Sin categoria'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {atleta.dolenciasActivasCount && atleta.dolenciasActivasCount > 0 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {atleta.dolenciasActivasCount}
                      </Badge>
                    )}
                    {atleta.ultimoTest && (
                      <Badge variant="outline" className="text-xs">
                        Test: {new Date(atleta.ultimoTest.fechaTest).toLocaleDateString('es-ES')}
                      </Badge>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {hayMas && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            y {atletas.length - maxMostrar} mas...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
