import { getActividadAction } from './_actions/get-actividad';
import { ActividadTable } from './_components/actividad-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Activity, CheckCircle, XCircle, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default async function ActividadPage() {
  const result = await getActividadAction({ limit: 100 });

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Registro de Actividad</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const actividades = result.data;
  const meta = result.meta;

  // Calcular estadisticas
  const totalExitosos = actividades.filter((a) => a.exito).length;
  const totalFallidos = actividades.filter((a) => !a.exito).length;
  const usuariosUnicos = new Set(actividades.map((a) => a.usuarioId).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registro de Actividad</h1>
        <p className="text-muted-foreground">
          Historial de acciones realizadas en el sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 overflow-hidden">
          <CardContent className="flex items-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold">{meta.total}</p>
              <p className="text-xs text-muted-foreground">Total Registros</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardContent className="flex items-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#11998e] to-[#38ef7d] text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold">{totalExitosos}</p>
              <p className="text-xs text-muted-foreground">Exitosos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardContent className="flex items-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#eb3349] to-[#f45c43] text-white">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold">{totalFallidos}</p>
              <p className="text-xs text-muted-foreground">Fallidos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardContent className="flex items-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold">{usuariosUnicos}</p>
              <p className="text-xs text-muted-foreground">Usuarios Activos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <ActividadTable actividades={actividades} />
    </div>
  );
}
