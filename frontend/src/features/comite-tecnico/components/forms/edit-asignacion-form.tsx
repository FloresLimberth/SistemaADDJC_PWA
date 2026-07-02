'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from './submit-button';
import { updateAsignacion } from '../../actions/asignacion.actions';
import { initialActionState } from '@/types/action-result';
import { Link as LinkIcon, User, Calendar } from 'lucide-react';
import { formatDateShort } from '@/lib/date-utils';
import type { Asignacion } from '../../types/planificacion.types';

interface EditAsignacionFormProps {
  asignacion: Asignacion;
  redirectUrl: string;
}

export function EditAsignacionForm({ asignacion, redirectUrl }: EditAsignacionFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);

  // Bind del action con el ID
  const updateAsignacionWithId = updateAsignacion.bind(null, asignacion.id);
  const [state, formAction] = useActionState(updateAsignacionWithId, initialActionState);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Asignacion actualizada', {
        description: state.message,
      });
      router.push(redirectUrl);
    }
  }, [state, router, redirectUrl]);

  // Mostrar toast en caso de error
  useEffect(() => {
    if (!state.success && state.error) {
      toast.error('Error', {
        description: state.error,
      });
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Informacion de solo lectura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Informacion de la Asignacion
          </CardTitle>
          <CardDescription>
            El atleta y microciclo no se pueden modificar. Para cambiarlos, elimina esta
            asignacion y crea una nueva.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Atleta
            </Label>
            <Input
              value={asignacion.atleta?.nombreCompleto || 'N/A'}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Microciclo
            </Label>
            <Input
              value={
                asignacion.microciclo
                  ? `Microciclo ${asignacion.microciclo.codigoMicrociclo} (${formatDateShort(asignacion.microciclo.fechaInicio)} - ${formatDateShort(asignacion.microciclo.fechaFin)})`
                  : 'N/A'
              }
              disabled
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campo editable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observaciones</CardTitle>
          <CardDescription>
            Puedes agregar o modificar las observaciones de esta asignacion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Input
              type="text"
              id="observaciones"
              name="observaciones"
              placeholder="Notas adicionales sobre la asignacion"
              maxLength={500}
              defaultValue={asignacion.observaciones || ''}
            />
            <p className="text-sm text-muted-foreground">Maximo 500 caracteres</p>
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end">
        <SubmitButton pendingText="Guardando...">
          <LinkIcon className="mr-2 h-4 w-4" />
          Guardar Cambios
        </SubmitButton>
      </div>
    </form>
  );
}
