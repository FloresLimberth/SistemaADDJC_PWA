import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { getStatsAction } from './_actions/get-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Settings, Activity, ArrowRight, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { ADMIN_ROUTES } from '@/lib/routes';

export default async function AdminDashboard() {
  // Obtener usuario actual y estadisticas en paralelo
  const [userResult, statsResult] = await Promise.all([
    getCurrentUserAction(),
    getStatsAction(),
  ]);

  if (!userResult.success || !userResult.user) {
    return null;
  }

  const { user } = userResult;

  // Valores por defecto si falla la carga de estadisticas
  const stats = statsResult.success
    ? statsResult.data
    : { total: 0, porRol: { ADMINISTRADOR: 0, COMITE_TECNICO: 0, ENTRENADOR: 0, ATLETA: 0 }, activos: 0, inactivos: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Dashboard Administrador</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.nombreCompleto}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-lg">
              <Users className="h-7 w-7" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Usuarios Totales</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">En el sistema</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#f093fb] to-[#f5576c] text-white shadow-lg">
              <Activity className="h-7 w-7" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Atletas</p>
              <p className="text-2xl font-bold mt-1">{stats.porRol.ATLETA}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Registrados</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-white shadow-lg">
              <UserCheck className="h-7 w-7" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Entrenadores</p>
              <p className="text-2xl font-bold mt-1">{stats.porRol.ENTRENADOR}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Activos</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#fa709a] to-[#fee140] text-white shadow-lg">
              <UserX className="h-7 w-7" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Inactivos</p>
              <p className="text-2xl font-bold mt-1">{stats.inactivos}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Desactivados</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestion de Usuarios</CardTitle>
            <CardDescription>
              Administra usuarios, roles y permisos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={ADMIN_ROUTES.usuarios.list}>
              <Button className="w-full bg-gradient-to-br from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                <Users className="mr-2 h-4 w-4" />
                Ver Usuarios
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuracion</CardTitle>
            <CardDescription>
              Ajustes del sistema y parametros generales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Configurar Sistema
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen por Rol</CardTitle>
          <CardDescription>
            Distribucion de usuarios en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.porRol.ADMINISTRADOR}</p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.porRol.COMITE_TECNICO}</p>
              <p className="text-sm text-muted-foreground">Comite Tecnico</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.porRol.ENTRENADOR}</p>
              <p className="text-sm text-muted-foreground">Entrenadores</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.porRol.ATLETA}</p>
              <p className="text-sm text-muted-foreground">Atletas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tu Rol</CardTitle>
          <CardDescription>
            Informacion sobre tus permisos y accesos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Rol Actual</p>
            <Badge className="mt-1" variant="default">
              {user.rol.replace('_', ' ')}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Permisos</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Gestion completa de usuarios</li>
              <li>Crear, editar y eliminar usuarios</li>
              <li>Cambiar roles y estados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
