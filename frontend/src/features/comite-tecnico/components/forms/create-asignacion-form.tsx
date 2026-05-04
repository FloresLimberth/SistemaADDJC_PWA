'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SubmitButton } from './submit-button';
import { createAsignacion } from '../../actions/asignacion.actions';
import { initialActionState } from '@/types/action-result';
import { Link as LinkIcon } from 'lucide-react';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';
import { formatDateShort } from '@/lib/date-utils';

interface Atleta {
  id: string;
  nombreCompleto: string;
}

interface Microciclo {
  id: string;
  codigoMicrociclo: string;
  fechaInicio: Date;
  fechaFin: Date;
}

interface CreateAsignacionFormProps {
  atletas: Atleta[];
  microciclos: Microciclo[];
}

// Formulario para crear una asignacion atleta-microciclo
export function CreateAsignacionForm({ atletas, microciclos }: CreateAsignacionFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(createAsignacion, initialActionState);
  const [selectedAtleta, setSelectedAtleta] = useState('');
  const [selectedMicrociclo, setSelectedMicrociclo] = useState('');

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Asignacion creada', {
        description: state.message,
      });
      router.push(COMITE_TECNICO_ROUTES.asignaciones.list);
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
  const getPreviousValue = (field: string): string => {
    if (!state.success && state.submittedData) {
      const value = state.submittedData[field];
      return value !== undefined && value !== null ? String(value) : '';
    }
    return '';
  };

  // Restaurar valores de selects si hay error
  useEffect(() => {
    if (!state.success && state.submittedData) {
      if (state.submittedData.atletaId) {
        setSelectedAtleta(String(state.submittedData.atletaId));
      }
      if (state.submittedData.microcicloId) {
        setSelectedMicrociclo(String(state.submittedData.microcicloId));
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Nueva Asignacion
          </CardTitle>
          <CardDescription>Asigna un atleta a un microciclo de entrenamiento</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Atleta *</Label>
            <Select
              value={selectedAtleta}
              onValueChange={setSelectedAtleta}
            >
              <SelectTrigger className={getFieldError('atletaId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un atleta" />
              </SelectTrigger>
              <SelectContent>
                {atletas.map((atleta) => (
                  <SelectItem key={atleta.id} value={atleta.id}>
                    {atleta.nombreCompleto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="atletaId" value={selectedAtleta} />
            {getFieldError('atletaId') && (
              <p className="text-sm text-destructive">{getFieldError('atletaId')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Microciclo *</Label>
            <Select
              value={selectedMicrociclo}
              onValueChange={setSelectedMicrociclo}
            >
              <SelectTrigger className={getFieldError('microcicloId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un microciclo" />
              </SelectTrigger>
              <SelectContent>
                {microciclos.map((micro) => (
                  <SelectItem key={micro.id} value={micro.id}>
                    Microciclo {micro.codigoMicrociclo} ({formatDateShort(micro.fechaInicio)} - {formatDateShort(micro.fechaFin)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="microcicloId" value={selectedMicrociclo} />
            {getFieldError('microcicloId') && (
              <p className="text-sm text-destructive">{getFieldError('microcicloId')}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Input
              type="text"
              id="observaciones"
              name="observaciones"
              placeholder="Notas adicionales sobre la asignacion"
              maxLength={500}
              defaultValue={getPreviousValue('observaciones')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end">
        <SubmitButton pendingText="Asignando...">
          <LinkIcon className="mr-2 h-4 w-4" />
          Crear Asignacion
        </SubmitButton>
      </div>
    </form>
  );
}
