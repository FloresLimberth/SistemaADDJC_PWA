'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SubmitButton } from './submit-button';
import { updateEntrenador } from '../../actions/entrenador.actions';
import { initialActionState } from '@/types/action-result';
import { MapPin, Save, UserCheck } from 'lucide-react';
import type { EntrenadorResumen } from '../../types/planificacion.types';

interface EditEntrenadorFormProps {
  entrenador: EntrenadorResumen;
}

// Formulario para editar un entrenador existente
export function EditEntrenadorForm({ entrenador }: EditEntrenadorFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);

  // Bind del action con el ID del entrenador
  const updateWithId = updateEntrenador.bind(null, entrenador.id);
  const [state, formAction] = useActionState(updateWithId, initialActionState);
  const [estadoActivo, setEstadoActivo] = useState(entrenador.usuario.estado);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Entrenador actualizado', {
        description: state.message,
      });
      router.back();
    }
  }, [state, router]);

  // Mostrar toast en caso de error
  useEffect(() => {
    if (!state.success && state.error) {
      toast.error('Error', {
        description: state.error,
      });
    }
  }, [state]);

  // Obtener error de un campo especifico
  const getFieldError = (field: string): string | undefined => {
    if (!state.success && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  // Obtener valor previo de un campo (para preservar datos al haber error)
  const getPreviousValue = (field: string, originalValue: string): string => {
    if (!state.success && state.submittedData) {
      const value = state.submittedData[field];
      return value !== undefined && value !== null
        ? String(value)
        : originalValue;
    }
    return originalValue;
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Seccion: Datos de Usuario (solo lectura) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Datos de Usuario
          </CardTitle>
          <CardDescription>
            Informacion de acceso al sistema (no editable)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>CI</Label>
            <Input
              type="text"
              value={entrenador.usuario.id}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input
              type="text"
              value={entrenador.usuario.nombreCompleto}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={entrenador.usuario.email}
              disabled
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Estado del Entrenador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Estado del Entrenador
          </CardTitle>
          <CardDescription>
            Activa o desactiva el entrenador en el sistema. Un entrenador
            desactivado no podra acceder al sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="estado">Entrenador Activo</Label>
              <p className="text-sm text-muted-foreground">
                {estadoActivo
                  ? 'El entrenador puede acceder al sistema'
                  : 'El entrenador no puede acceder al sistema'}
              </p>
            </div>
            <Switch
              id="estado"
              checked={estadoActivo}
              onCheckedChange={setEstadoActivo}
            />
          </div>
          <input type="hidden" name="estado" value={String(estadoActivo)} />
        </CardContent>
      </Card>

      {/* Seccion: Datos del Entrenador (editables) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Datos del Entrenador
          </CardTitle>
          <CardDescription>
            Informacion profesional del entrenador
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="municipio">Municipio *</Label>
            <Input
              type="text"
              id="municipio"
              name="municipio"
              placeholder="Ej: Cochabamba"
              defaultValue={getPreviousValue('municipio', entrenador.municipio)}
              className={getFieldError('municipio') ? 'border-destructive' : ''}
            />
            {getFieldError('municipio') && (
              <p className="text-sm text-destructive">
                {getFieldError('municipio')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="especialidad">Especialidad</Label>
            <Input
              type="text"
              id="especialidad"
              name="especialidad"
              placeholder="Ej: Judo, Ne-waza, Preparacion fisica"
              defaultValue={getPreviousValue(
                'especialidad',
                entrenador.especialidad || ''
              )}
              className={
                getFieldError('especialidad') ? 'border-destructive' : ''
              }
            />
            {getFieldError('especialidad') && (
              <p className="text-sm text-destructive">
                {getFieldError('especialidad')}
              </p>
            )}
            <p className="text-sm text-muted-foreground">Campo opcional</p>
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end gap-4">
        <SubmitButton pendingText="Guardando...">
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </SubmitButton>
      </div>
    </form>
  );
}
