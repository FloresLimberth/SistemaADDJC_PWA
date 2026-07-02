import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchAtleta } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Scale,
  UserCog,
  Edit,
} from 'lucide-react';
import { formatDateLocale } from '@/lib/date-utils';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';
import { DeleteAtletaButton } from './delete-button';

interface AtletaDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function AtletaDetallePage({ params }: AtletaDetallePageProps) {
  const { id } = await params;

  const atleta = await fetchAtleta(id);

  if (!atleta) {
    notFound();
  }

  // Formatear fecha de nacimiento
  const fechaNacimiento = formatDateLocale(atleta.fechaNacimiento, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header con navegacion */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={COMITE_TECNICO_ROUTES.atletas.list}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{atleta.usuario.nombreCompleto}</h1>
              <Badge variant={atleta.usuario.estado ? 'default' : 'destructive'}>
                {atleta.usuario.estado ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{atleta.club} - {atleta.categoria}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={COMITE_TECNICO_ROUTES.atletas.editar(id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteAtletaButton
            atletaId={id}
            atletaNombre={atleta.usuario.nombreCompleto}
            redirectUrl={COMITE_TECNICO_ROUTES.atletas.list}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informacion Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informacion Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CI</p>
                <p className="font-medium">{atleta.usuario.ci}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Edad</p>
                <p className="font-medium">{atleta.edad} anios</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Fecha de Nacimiento
              </p>
              <p className="font-medium">{fechaNacimiento}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="font-medium">{atleta.usuario.email}</p>
            </div>

            {atleta.telefono && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Telefono
                </p>
                <p className="font-medium">{atleta.telefono}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Ubicacion
              </p>
              <p className="font-medium">{atleta.municipio}</p>
              {atleta.direccion && (
                <p className="text-sm text-muted-foreground">{atleta.direccion}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informacion Deportiva */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Informacion Deportiva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Club</p>
                <p className="font-medium">{atleta.club}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">{atleta.categoria}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Categoria de Peso</p>
              {atleta.categoriaPeso ? (
                <Badge variant="outline">{atleta.categoriaPeso.replace(/_/g, ' ')}</Badge>
              ) : (
                <p className="font-medium text-muted-foreground">Sin asignar</p>
              )}
            </div>

            {atleta.pesoActual && (
              <div>
                <p className="text-sm text-muted-foreground">Peso Actual</p>
                <p className="font-medium">{atleta.pesoActual} kg</p>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <UserCog className="h-4 w-4" />
                Entrenador Asignado
              </p>
              {atleta.entrenadorAsignado ? (
                <p className="font-medium">{atleta.entrenadorAsignado.nombreCompleto}</p>
              ) : (
                <p className="text-orange-500 font-medium">Sin entrenador asignado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rapidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rapidas</CardTitle>
          <CardDescription>
            Gestiona la informacion del atleta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href={`/comite-tecnico/tests-fisicos?atletaId=${id}`}>
                Ver Tests Fisicos
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/comite-tecnico/dolencias?atletaId=${id}`}>
                Ver Dolencias
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/comite-tecnico/asignaciones?atletaId=${id}`}>
                Ver Asignaciones
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
