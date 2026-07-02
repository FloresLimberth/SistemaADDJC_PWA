import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchTestFisico } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  User,
  Dumbbell,
  Timer,
  Heart,
  FileText,
  UserCog,
} from 'lucide-react';

interface TestFisicoDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function TestFisicoDetallePage({ params }: TestFisicoDetallePageProps) {
  const { id } = await params;

  const test = await fetchTestFisico(id);

  if (!test) {
    notFound();
  }

  // Formatear fecha
  const fechaTest = new Date(test.fechaTest).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Helper para mostrar valor o guion
  const showValue = (value: string | number | null | undefined, suffix = '') => {
    if (value === null || value === undefined || value === '') return '-';
    return `${value}${suffix}`;
  };

  // Determinar color del badge de clasificacion VO2max
  const getVO2maxBadgeVariant = (clasificacion: string | null | undefined) => {
    if (!clasificacion) return 'outline';
    const lower = clasificacion.toLowerCase();
    if (lower.includes('excelente') || lower.includes('superior')) return 'default';
    if (lower.includes('bueno') || lower.includes('alto')) return 'secondary';
    if (lower.includes('intermedio') || lower.includes('medio')) return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header con navegacion */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/comite-tecnico/tests-fisicos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Test Fisico</h1>
            <Badge variant="outline">#{test.id}</Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {fechaTest}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informacion del Atleta y Entrenador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Participantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Atleta</p>
              <p className="font-medium text-lg">{test.atleta?.nombreCompleto || 'N/A'}</p>
              {test.atleta && (
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href={`/comite-tecnico/atletas/${test.atleta.id}`}>
                    Ver perfil del atleta
                  </Link>
                </Button>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <UserCog className="h-4 w-4" />
                Registrado por
              </p>
              <p className="font-medium">{test.entrenador?.nombreCompleto || 'N/A'}</p>
            </div>
            {test.microciclo && (
              <div>
                <p className="text-sm text-muted-foreground">Microciclo</p>
                <p className="font-medium">Semana {test.microciclo.codigoMicrociclo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resistencia Aerobica y VO2max */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Resistencia Aerobica
            </CardTitle>
            <CardDescription>Test Navette y capacidad aerobica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Navette (Palier)</p>
                <p className="text-2xl font-bold">{showValue(test.navettePalier)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VO2max</p>
                <p className="text-2xl font-bold text-blue-600">
                  {showValue(test.navetteVO2max, ' ml/kg/min')}
                </p>
              </div>
            </div>
            {test.clasificacionVO2max && (
              <div>
                <p className="text-sm text-muted-foreground">Clasificacion</p>
                <Badge variant={getVO2maxBadgeVariant(test.clasificacionVO2max)}>
                  {test.clasificacionVO2max}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Objetivo: {test.objetivoVO2max} ml/kg/min
                </p>
              </div>
            )}
            {test.test1500m && (
              <div>
                <p className="text-sm text-muted-foreground">Test 1500m</p>
                <p className="font-medium">
                  {test.test1500m}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fuerza Maxima */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Fuerza Maxima (1RM)
          </CardTitle>
          <CardDescription>Tests de repeticion maxima en kilogramos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Press Banca</p>
              <p className="text-3xl font-bold">{showValue(test.pressBanca, ' kg')}</p>
              {test.pressBancaIntensidad && (
                <Badge variant="outline" className="mt-2">
                  {test.pressBancaIntensidad}% intensidad
                </Badge>
              )}
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Tiron</p>
              <p className="text-3xl font-bold">{showValue(test.tiron, ' kg')}</p>
              {test.tironIntensidad && (
                <Badge variant="outline" className="mt-2">
                  {test.tironIntensidad}% intensidad
                </Badge>
              )}
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Sentadilla</p>
              <p className="text-3xl font-bold">{showValue(test.sentadilla, ' kg')}</p>
              {test.sentadillaIntensidad && (
                <Badge variant="outline" className="mt-2">
                  {test.sentadillaIntensidad}% intensidad
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fuerza Resistencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Fuerza Resistencia
          </CardTitle>
          <CardDescription>Repeticiones maximas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Barra Fija</p>
              <p className="text-3xl font-bold">{showValue(test.barraFija, ' reps')}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Paralelas</p>
              <p className="text-3xl font-bold">{showValue(test.paralelas, ' reps')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {(test.observaciones || test.condicionesTest) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {test.condicionesTest && (
              <div>
                <p className="text-sm text-muted-foreground">Condiciones del Test</p>
                <p className="mt-1">{test.condicionesTest}</p>
              </div>
            )}
            {test.observaciones && (
              <div>
                <p className="text-sm text-muted-foreground">Observaciones Generales</p>
                <p className="mt-1">{test.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Acciones rapidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {test.atleta && (
              <>
                <Button variant="outline" asChild>
                  <Link href={`/comite-tecnico/atletas/${test.atleta.id}`}>
                    Ver Atleta
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/comite-tecnico/tests-fisicos?atletaId=${test.atleta.id}`}>
                    Historial del Atleta
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
