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
import { createMesociclo } from '../../actions/mesociclo.actions';
import { initialActionState } from '@/types/action-result';
import { Calendar, Target, Layers } from 'lucide-react';
import { EtapaMesocicloValues } from '@/types/enums';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';
import type { Macrociclo } from '../../types/planificacion.types';

interface CreateMesocicloFormProps {
  macrociclos: Pick<Macrociclo, 'id' | 'nombre' | 'temporada'>[];
  preselectedMacrocicloId?: string;
}

// Formulario para crear un nuevo mesociclo
export function CreateMesocicloForm({ macrociclos, preselectedMacrocicloId }: CreateMesocicloFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(createMesociclo, initialActionState);
  const [selectedMacrociclo, setSelectedMacrociclo] = useState(preselectedMacrocicloId || '');
  const [selectedEtapa, setSelectedEtapa] = useState('');

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Mesociclo creado', {
        description: state.message,
      });
      router.push(COMITE_TECNICO_ROUTES.planificacion.mesociclos.list);
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
      if (state.submittedData.macrocicloId) {
        setSelectedMacrociclo(String(state.submittedData.macrocicloId));
      }
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
          <div className="space-y-2 md:col-span-2">
            <Label>Macrociclo *</Label>
            <Select
              value={selectedMacrociclo}
              onValueChange={setSelectedMacrociclo}
            >
              <SelectTrigger className={getFieldError('macrocicloId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un macrociclo" />
              </SelectTrigger>
              <SelectContent>
                {macrociclos.map((macro) => (
                  <SelectItem key={macro.id} value={macro.id}>
                    {macro.nombre} ({macro.temporada})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="macrocicloId" value={selectedMacrociclo} />
            {getFieldError('macrocicloId') && (
              <p className="text-sm text-destructive">{getFieldError('macrocicloId')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Ej: Preparacion General 1"
              defaultValue={getPreviousValue('nombre')}
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
              placeholder="Ej: M1-PG"
              maxLength={50}
              defaultValue={getPreviousValue('codigoMesociclo')}
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
            <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
            <Input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              defaultValue={getPreviousValue('fechaInicio')}
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
              defaultValue={getPreviousValue('fechaFin')}
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
              placeholder="Desarrollo de la resistencia aerobica..."
              rows={2}
              defaultValue={getPreviousValue('objetivoFisico')}
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
              placeholder="Perfeccionar las tecnicas de proyeccion..."
              rows={2}
              defaultValue={getPreviousValue('objetivoTecnico')}
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
              placeholder="Desarrollar estrategias de combate..."
              rows={2}
              defaultValue={getPreviousValue('objetivoTactico')}
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
        <SubmitButton pendingText="Creando...">
          <Layers className="mr-2 h-4 w-4" />
          Crear Mesociclo
        </SubmitButton>
      </div>
    </form>
  );
}
