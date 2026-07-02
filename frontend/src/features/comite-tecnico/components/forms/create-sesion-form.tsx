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
import { createSesion } from '../../actions/sesion.actions';
import { initialActionState } from '@/types/action-result';
import { CalendarClock, Activity, FileText } from 'lucide-react';
import { DiaSemanaValues, TipoSesionValues, TurnoValues } from '@/types/enums';
import type { MicrocicloParaSelector } from '../../actions/fetch-planificacion';
import type { EjerciciosPorTipoResponse } from '@/features/algoritmo/types/algoritmo.types';
import { EjerciciosSelector } from './ejercicios-selector';
import type { EjercicioSeleccionado } from './ejercicios-selector';

interface CreateSesionFormProps {
  microciclos: MicrocicloParaSelector[];
  redirectUrl: string;
  catalogoPorTipo?: EjerciciosPorTipoResponse | null;
}

// Mapeo de dias para formato legible
const DIA_LABELS: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miercoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sabado',
  DOMINGO: 'Domingo',
};

const TIPO_LABELS: Record<string, string> = {
  ENTRENAMIENTO: 'Entrenamiento',
  TEST: 'Test Fisico',
  RECUPERACION: 'Recuperacion',
  DESCANSO: 'Descanso',
  COMPETENCIA: 'Competencia',
};

const TURNO_LABELS: Record<string, string> = {
  MANANA: 'Manana',
  TARDE: 'Tarde',
  COMPLETO: 'Completo',
};

// Tipos de sesion que NO requieren campos de planificacion detallada ni contenidos
// TEST tiene ejercicios predefinidos (press banca, tiron, sentadilla, navette, etc.)
const TIPOS_SIN_PLANIFICACION = ['COMPETENCIA', 'DESCANSO', 'TEST'];

export function CreateSesionForm({ microciclos, redirectUrl, catalogoPorTipo }: CreateSesionFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(createSesion, initialActionState);

  // Estados para los selects
  const [selectedMicrociclo, setSelectedMicrociclo] = useState('');
  const [selectedDia, setSelectedDia] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('COMPLETO');
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState<EjercicioSeleccionado[]>([]);

  // Determina si mostrar campos de planificacion detallada y contenidos
  const showPlanificacionDetallada = !TIPOS_SIN_PLANIFICACION.includes(selectedTipo);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Sesion creada', {
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

  // Obtener error de un campo especifico
  const getFieldError = (field: string): string | undefined => {
    if (!state.success && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  // Obtener valor previo de un campo
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
      if (state.submittedData.microcicloId) {
        setSelectedMicrociclo(String(state.submittedData.microcicloId));
      }
      if (state.submittedData.diaSemana) {
        setSelectedDia(String(state.submittedData.diaSemana));
      }
      if (state.submittedData.tipoSesion) {
        setSelectedTipo(String(state.submittedData.tipoSesion));
      }
      if (state.submittedData.turno) {
        setSelectedTurno(String(state.submittedData.turno));
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Datos Basicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Datos de la Sesion
          </CardTitle>
          <CardDescription>Informacion basica de la sesion</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Microciclo *</Label>
            <Select value={selectedMicrociclo} onValueChange={setSelectedMicrociclo}>
              <SelectTrigger className={getFieldError('microcicloId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona un microciclo" />
              </SelectTrigger>
              <SelectContent>
                {microciclos.map((micro) => (
                  <SelectItem key={micro.id} value={micro.id}>
                    {micro.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="microcicloId" value={selectedMicrociclo} />
            {getFieldError('microcicloId') && (
              <p className="text-sm text-destructive">{getFieldError('microcicloId')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha *</Label>
            <Input
              type="date"
              id="fecha"
              name="fecha"
              defaultValue={getPreviousValue('fecha')}
              className={getFieldError('fecha') ? 'border-destructive' : ''}
            />
            {getFieldError('fecha') && (
              <p className="text-sm text-destructive">{getFieldError('fecha')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Dia de la Semana *</Label>
            <Select value={selectedDia} onValueChange={setSelectedDia}>
              <SelectTrigger className={getFieldError('diaSemana') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona el dia" />
              </SelectTrigger>
              <SelectContent>
                {DiaSemanaValues.map((dia) => (
                  <SelectItem key={dia} value={dia}>
                    {DIA_LABELS[dia] || dia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="diaSemana" value={selectedDia} />
            {getFieldError('diaSemana') && (
              <p className="text-sm text-destructive">{getFieldError('diaSemana')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroSesion">Numero de Sesion *</Label>
            <Input
              type="number"
              id="numeroSesion"
              name="numeroSesion"
              min="1"
              max="7"
              placeholder="1"
              defaultValue={getPreviousValue('numeroSesion')}
              className={getFieldError('numeroSesion') ? 'border-destructive' : ''}
            />
            {getFieldError('numeroSesion') && (
              <p className="text-sm text-destructive">{getFieldError('numeroSesion')}</p>
            )}
            <p className="text-xs text-muted-foreground">Numero de sesion en el microciclo (1-7)</p>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Sesion *</Label>
            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger className={getFieldError('tipoSesion') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {TipoSesionValues.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_LABELS[tipo] || tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="tipoSesion" value={selectedTipo} />
            {getFieldError('tipoSesion') && (
              <p className="text-sm text-destructive">{getFieldError('tipoSesion')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Turno</Label>
            <Select value={selectedTurno} onValueChange={setSelectedTurno}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el turno" />
              </SelectTrigger>
              <SelectContent>
                {TurnoValues.map((turno) => (
                  <SelectItem key={turno} value={turno}>
                    {TURNO_LABELS[turno] || turno}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="turno" value={selectedTurno} />
          </div>
        </CardContent>
      </Card>

      {/* Planificacion de Carga */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {showPlanificacionDetallada ? 'Planificacion de Carga' : 'Duracion'}
          </CardTitle>
          <CardDescription>
            {showPlanificacionDetallada
              ? 'Define la duracion, volumen e intensidad planificada'
              : 'Define la duracion estimada de la sesion'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="duracionPlanificada">Duracion (minutos) *</Label>
            <Input
              type="number"
              id="duracionPlanificada"
              name="duracionPlanificada"
              min="1"
              placeholder="90"
              defaultValue={getPreviousValue('duracionPlanificada')}
              className={getFieldError('duracionPlanificada') ? 'border-destructive' : ''}
            />
            {getFieldError('duracionPlanificada') && (
              <p className="text-sm text-destructive">{getFieldError('duracionPlanificada')}</p>
            )}
          </div>

          {showPlanificacionDetallada && (
            <>
              <div className="space-y-2">
                <Label htmlFor="volumenPlanificado">Volumen *</Label>
                <Input
                  type="number"
                  id="volumenPlanificado"
                  name="volumenPlanificado"
                  min="0"
                  placeholder="100"
                  defaultValue={getPreviousValue('volumenPlanificado')}
                  className={getFieldError('volumenPlanificado') ? 'border-destructive' : ''}
                />
                {getFieldError('volumenPlanificado') && (
                  <p className="text-sm text-destructive">{getFieldError('volumenPlanificado')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="intensidadPlanificada">Intensidad (%) *</Label>
                <Input
                  type="number"
                  id="intensidadPlanificada"
                  name="intensidadPlanificada"
                  min="0"
                  max="100"
                  placeholder="75"
                  defaultValue={getPreviousValue('intensidadPlanificada')}
                  className={getFieldError('intensidadPlanificada') ? 'border-destructive' : ''}
                />
                {getFieldError('intensidadPlanificada') && (
                  <p className="text-sm text-destructive">{getFieldError('intensidadPlanificada')}</p>
                )}
              </div>

            </>
          )}
        </CardContent>
      </Card>

      {/* Contenidos - Solo para tipos que requieren planificacion */}
      {showPlanificacionDetallada && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contenidos de la Sesion
            </CardTitle>
            <CardDescription>Define los contenidos fisico, tecnico y tactico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contenidoFisico">Contenido Fisico *</Label>
              <Textarea
                id="contenidoFisico"
                name="contenidoFisico"
                placeholder="Resistencia aerobica, fuerza explosiva..."
                rows={2}
                defaultValue={getPreviousValue('contenidoFisico')}
                className={getFieldError('contenidoFisico') ? 'border-destructive' : ''}
              />
              {getFieldError('contenidoFisico') && (
                <p className="text-sm text-destructive">{getFieldError('contenidoFisico')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenidoTecnico">Contenido Tecnico *</Label>
              <Textarea
                id="contenidoTecnico"
                name="contenidoTecnico"
                placeholder="Uchi-komi, nage-komi, trabajo de agarre..."
                rows={2}
                defaultValue={getPreviousValue('contenidoTecnico')}
                className={getFieldError('contenidoTecnico') ? 'border-destructive' : ''}
              />
              {getFieldError('contenidoTecnico') && (
                <p className="text-sm text-destructive">{getFieldError('contenidoTecnico')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenidoTactico">Contenido Tactico *</Label>
              <Textarea
                id="contenidoTactico"
                name="contenidoTactico"
                placeholder="Estrategia de combate, situaciones especificas..."
                rows={2}
                defaultValue={getPreviousValue('contenidoTactico')}
                className={getFieldError('contenidoTactico') ? 'border-destructive' : ''}
              />
              {getFieldError('contenidoTactico') && (
                <p className="text-sm text-destructive">{getFieldError('contenidoTactico')}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="calentamiento">Calentamiento (opcional)</Label>
                <Textarea
                  id="calentamiento"
                  name="calentamiento"
                  placeholder="Movilidad articular, carrera suave..."
                  rows={2}
                  defaultValue={getPreviousValue('calentamiento')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partePrincipal">Parte Principal (opcional)</Label>
                <Textarea
                  id="partePrincipal"
                  name="partePrincipal"
                  placeholder="Descripcion de la parte central..."
                  rows={2}
                  defaultValue={getPreviousValue('partePrincipal')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vueltaCalma">Vuelta a la Calma (opcional)</Label>
                <Textarea
                  id="vueltaCalma"
                  name="vueltaCalma"
                  placeholder="Estiramientos, relajacion..."
                  rows={2}
                  defaultValue={getPreviousValue('vueltaCalma')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ejercicios del Catalogo - Solo para tipos con planificacion */}
      {showPlanificacionDetallada && catalogoPorTipo && (
        <>
          <EjerciciosSelector
            catalogoPorTipo={catalogoPorTipo}
            value={ejerciciosSeleccionados}
            onChange={setEjerciciosSeleccionados}
          />
          <input
            type="hidden"
            name="ejerciciosJSON"
            value={JSON.stringify(
              ejerciciosSeleccionados.map(({ nombre, tipo, ...rest }) => rest)
            )}
          />
        </>
      )}

      {/* Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informacion Adicional</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              placeholder="Notas adicionales..."
              rows={2}
              defaultValue={getPreviousValue('observaciones')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materialNecesario">Material Necesario (opcional)</Label>
            <Textarea
              id="materialNecesario"
              name="materialNecesario"
              placeholder="Tatami, pesas, cronometro..."
              rows={2}
              defaultValue={getPreviousValue('materialNecesario')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end">
        <SubmitButton pendingText="Creando...">
          <CalendarClock className="mr-2 h-4 w-4" />
          Crear Sesion
        </SubmitButton>
      </div>
    </form>
  );
}
