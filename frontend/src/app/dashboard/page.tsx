import { getCurrentUserAction, logoutAction } from '../actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  // Obtener usuario actual desde el token
  const result = await getCurrentUserAction();

  if (!result.success || !result.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Error al cargar usuario</p>
      </div>
    );
  }

  const { user } = result;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="bg-danger text-white hover:bg-danger-dark">
              Cerrar Sesion
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido al Sistema ADDJC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nombre:</p>
              <p className="text-lg font-semibold">{user.nombreCompleto}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rol:</p>
              <p className="text-lg font-semibold">
                <span className="rounded-md bg-primary/10 px-3 py-1 text-primary">
                  {user.rol}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID:</p>
              <p className="text-lg font-mono">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fase 2: Autenticacion Completada</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Login funcional con JWT</li>
              <li>Cookies HttpOnly seguras</li>
              <li>Middleware protegiendo rutas</li>
              <li>Server Actions implementadas</li>
              <li>Validacion con Zod</li>
              <li>CORS configurado correctamente</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
