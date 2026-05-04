import { getUsuariosAction } from './_actions/get-usuarios';
import { UsuariosTable } from './_components/usuarios-table';
import { CrearUsuarioDialog } from './_components/crear-usuario-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default async function UsuariosPage() {
  const result = await getUsuariosAction();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestion de Usuarios</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Type narrowing: ahora TypeScript sabe que result tiene data y meta
  const { data: usuarios, meta } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra todos los usuarios del sistema ADDJC
          </p>
        </div>
        <CrearUsuarioDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{meta.total}</div>
          <p className="text-xs text-muted-foreground">Total Usuarios</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {usuarios.filter((u) => u.rol === 'ATLETA').length}
          </div>
          <p className="text-xs text-muted-foreground">Atletas</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {usuarios.filter((u) => u.rol === 'ENTRENADOR').length}
          </div>
          <p className="text-xs text-muted-foreground">Entrenadores</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {usuarios.filter((u) => u.estado).length}
          </div>
          <p className="text-xs text-muted-foreground">Activos</p>
        </div>
      </div>

      {/* Table */}
      <UsuariosTable usuarios={usuarios} />
    </div>
  );
}
