'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { updateMesociclo } from '../../actions/mesociclo.actions';
import { initialActionState } from '@/types/action-result';
import { Target, Layers, Save } from 'lucide-react';
import { EtapaMesocicloValues } from '@/types/enums';
import type { Mesociclo } from '../../types/planificacion.types';
import { formatDateForInput } from '@/lib/date-utils';

interface EditMesocicloFormProps {
  mesociclo: Mesociclo;
}

// Formulario para editar un mesociclo existente
export function EditMesocicloForm({ mesociclo }: EditMesocicloFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);

  // Bind del action con el ID del mesociclo
  const updateWithId = updateMesociclo.bind(null, mesociclo.id);
  const [state, formAction] = useActionState(updateWithId, initialActionState);
  const [selectedEtapa, setSelectedEtapa] = useState(mesociclo.etapa);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Mesociclo actualizado', {
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
      return value !== undefined && value !== null ? String(value) : originalValue;
    }
    return originalValue;
  };

  // Restaurar valores de selects controlados si hay error
  useEffect(() => {
    if (!state.success && state.submittedData) {
      if (state.submittedData.etapa) {
        setSelectedEtapa(String(state.submittedData.etapa));
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Datos Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Datos del Mesociclo
          </CardTitle>
          <CardDescription>Informacion basica del mesociclo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              type="text"
              id="nombre"
              name="nombre"
              defaultValue={getPreviousValue('nombre', mesociclo.nombre)}
              placeholder="Ej: Preparacion General 1"
              className={getFieldError('nombre') ? 'border-destructive' : ''}
            />
            {getFieldError('nombre') && (
              <p className="text-sm text-destructive">{getFieldError('nombre')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigoMesociclo">Codigo de Mesociclo *</Label>
            <Input
              type="text"
              id="codigoMesociclo"
              name="codigoMesociclo"
              maxLength={50}
              defaultValue={getPreviousValue('codigoMesociclo', mesociclo.codigoMesociclo)}
              className={getFieldError('codigoMesociclo') ? 'border-destructive' : ''}
            />
            {getFieldError('codigoMesociclo') && (
              <p className="text-sm text-destructive">{getFieldError('codigoMesociclo')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Etapa *</Label>
            <Select
              value={selectedEtapa}
              onValueChange={setSelectedEtapa}
            >
              <SelectTrigger className={getFieldError('etapa') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona una etapa" />
              </SelectTrigger>
              <SelectContent>
                {EtapaMesocicloValues.map((etapa) => (
                  <SelectItem key={etapa} value={etapa}>
                    {etapa.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="etapa" value={selectedEtapa} />
            {getFieldError('etapa') && (
              <p className="text-sm text-destructive">{getFieldError('etapa')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Macrociclo</Label>
            <Input
              type="text"
              value={mesociclo.macrociclo?.nombre || 'No asignado'}
              disabled
              className="bg-muted"
            />
            <input type="hidden" name="macrocicloId" value={mesociclo.macrocicloId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
            <Input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              defaultValue={getPreviousValue('fechaInicio', formatDateForInput(mesociclo.fechaInicio))}
              className={getFieldError('fechaInicio') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaInicio') && (
              <p className="text-sm text-destructive">{getFieldError('fechaInicio')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha Fin *</Label>
            <Input
              type="date"
              id="fechaFin"
              name="fechaFin"
              defaultValue={getPreviousValue('fechaFin', formatDateForInput(mesociclo.fechaFin))}
              className={getFieldError('fechaFin') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaFin') && (
              <p className="text-sm text-destructive">{getFieldError('fechaFin')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos
          </CardTitle>
          <CardDescription>Define los objetivos del mesociclo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objetivoFisico">Objetivo Fisico *</Label>
            <Textarea
              id="objetivoFisico"
              name="objetivoFisico"
              defaultValue={getPreviousValue('objetivoFisico', mesociclo.objetivoFisico)}
              rows={2}
              className={getFieldError('objetivoFisico') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivoFisico') && (
              <p className="text-sm text-destructive">{getFieldError('objetivoFisico')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivoTecnico">Objetivo Tecnico *</Label>
            <Textarea
              id="objetivoTecnico"
              name="objetivoTecnico"
              defaultValue={getPreviousValue('objetivoTecnico', mesociclo.objetivoTecnico)}
              rows={2}
              className={getFieldError('objetivoTecnico') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivoTecnico') && (
              <p className="text-sm text-destructive">{getFieldError('objetivoTecnico')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivoTactico">Objetivo Tactico *</Label>
            <Textarea
              id="objetivoTactico"
              name="objetivoTactico"
              defaultValue={getPreviousValue('objetivoTactico', mesociclo.objetivoTactico)}
              rows={2}
              className={getFieldError('objetivoTactico') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivoTactico') && (
              <p className="text-sm text-destructive">{getFieldError('objetivoTactico')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end">
        <SubmitButton pendingText="Guardando...">
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </SubmitButton>
      </div>
    </form>
  );
}
