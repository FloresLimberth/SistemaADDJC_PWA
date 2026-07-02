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
import { updateMicrociclo } from '../../actions/microciclo.actions';
import { initialActionState } from '@/types/action-result';
import { Calendar, Target, Activity, Save } from 'lucide-react';
import { TipoMicrocicloValues } from '@/types/enums';
import type { MicrocicloType } from '../../types/planificacion.types';
import { formatDateForInput } from '@/lib/date-utils';

interface EditMicrocicloFormProps {
  microciclo: MicrocicloType;
}

// Formulario para editar un microciclo existente
export function EditMicrocicloForm({ microciclo }: EditMicrocicloFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);

  // Bind del action con el ID del microciclo
  const updateWithId = updateMicrociclo.bind(null, microciclo.id);
  const [state, formAction] = useActionState(updateWithId, initialActionState);
  const [selectedTipo, setSelectedTipo] = useState(microciclo.tipoMicrociclo);
  const [fechaInicio, setFechaInicio] = useState(formatDateForInput(microciclo.fechaInicio));
  const [fechaFin, setFechaFin] = useState(formatDateForInput(microciclo.fechaFin));
  const [errorFechaInicio, setErrorFechaInicio] = useState<string | null>(null);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Microciclo actualizado', {
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
      if (state.submittedData.tipoMicrociclo) {
        setSelectedTipo(String(state.submittedData.tipoMicrociclo));
      }
      if (state.submittedData.fechaInicio) {
        setFechaInicio(String(state.submittedData.fechaInicio));
      }
    }
  }, [state]);

  // Validar que fechaInicio sea LUNES y calcular fechaFin
  useEffect(() => {
    if (fechaInicio) {
      const inicio = new Date(fechaInicio + 'T00:00:00');
      const diaSemana = inicio.getDay();

      // Validar que sea lunes (getDay() === 1)
      if (diaSemana !== 1) {
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        setErrorFechaInicio(`La fecha debe ser un LUNES. Seleccionaste ${diasSemana[diaSemana]}.`);
        setFechaFin('');
      } else {
        setErrorFechaInicio(null);
        // Calcular fechaFin (fechaInicio + 6 dias = 7 dias totales)
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 6);
        setFechaFin(fin.toISOString().split('T')[0]);
      }
    } else {
      setErrorFechaInicio(null);
      setFechaFin('');
    }
  }, [fechaInicio]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Datos Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Datos del Microciclo
          </CardTitle>
          <CardDescription>Informacion basica del microciclo semanal</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Mesociclo</Label>
            <Input
              type="text"
              value={microciclo.mesociclo?.nombre || 'Sin mesociclo asignado'}
              disabled
              className="bg-muted"
            />
            {microciclo.mesocicloId && (
              <input type="hidden" name="mesocicloId" value={microciclo.mesocicloId} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigoMicrociclo">Codigo de Microciclo *</Label>
            <Input
              type="text"
              id="codigoMicrociclo"
              name="codigoMicrociclo"
              defaultValue={getPreviousValue('codigoMicrociclo', microciclo.codigoMicrociclo)}
              className={getFieldError('codigoMicrociclo') ? 'border-destructive' : ''}
            />
            {getFieldError('codigoMicrociclo') && (
              <p className="text-sm text-destructive">{getFieldError('codigoMicrociclo')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de Microciclo *</Label>
            <Select
              value={selectedTipo}
              onValueChange={setSelectedTipo}
            >
              <SelectTrigger className={getFieldError('tipoMicrociclo') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {TipoMicrocicloValues.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="tipoMicrociclo" value={selectedTipo} />
            {getFieldError('tipoMicrociclo') && (
              <p className="text-sm text-destructive">{getFieldError('tipoMicrociclo')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Inicio (Lunes) *</Label>
            <Input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className={getFieldError('fechaInicio') || errorFechaInicio ? 'border-destructive' : ''}
            />
            {errorFechaInicio && (
              <p className="text-sm text-destructive">{errorFechaInicio}</p>
            )}
            {!errorFechaInicio && getFieldError('fechaInicio') && (
              <p className="text-sm text-destructive">{getFieldError('fechaInicio')}</p>
            )}
            <p className="text-xs text-muted-foreground">Debe ser un lunes (inicio de semana)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha Fin (Domingo) *</Label>
            <Input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={fechaFin}
              readOnly
              className="bg-muted"
            />
            {getFieldError('fechaFin') && (
              <p className="text-sm text-destructive">{getFieldError('fechaFin')}</p>
            )}
            <p className="text-xs text-muted-foreground">Se calcula automaticamente (7 dias)</p>
          </div>
        </CardContent>
      </Card>

      {/* Volumen e Intensidad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Carga de Entrenamiento
          </CardTitle>
          <CardDescription>Define el volumen e intensidad de la semana</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="volumenTotal">Volumen Total *</Label>
            <Input
              type="number"
              id="volumenTotal"
              name="volumenTotal"
              min="0"
              step="0.01"
              defaultValue={getPreviousValue('volumenTotal', String(microciclo.volumenTotal))}
              className={getFieldError('volumenTotal') ? 'border-destructive' : ''}
            />
            {getFieldError('volumenTotal') && (
              <p className="text-sm text-destructive">{getFieldError('volumenTotal')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensidadPromedio">Intensidad Promedio (%) *</Label>
            <Input
              type="number"
              id="intensidadPromedio"
              name="intensidadPromedio"
              min="0"
              max="100"
              step="0.01"
              defaultValue={getPreviousValue('intensidadPromedio', String(microciclo.intensidadPromedio))}
              className={getFieldError('intensidadPromedio') ? 'border-destructive' : ''}
            />
            {getFieldError('intensidadPromedio') && (
              <p className="text-sm text-destructive">{getFieldError('intensidadPromedio')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objetivo y Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivo Semanal
          </CardTitle>
          <CardDescription>Define el objetivo de esta semana de entrenamiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objetivoSemanal">Objetivo *</Label>
            <Textarea
              id="objetivoSemanal"
              name="objetivoSemanal"
              defaultValue={getPreviousValue('objetivoSemanal', microciclo.objetivoSemanal)}
              rows={3}
              className={getFieldError('objetivoSemanal') ? 'border-destructive' : ''}
            />
            {getFieldError('objetivoSemanal') && (
              <p className="text-sm text-destructive">{getFieldError('objetivoSemanal')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              defaultValue={getPreviousValue('observaciones', microciclo.observaciones || '')}
              rows={2}
            />
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
