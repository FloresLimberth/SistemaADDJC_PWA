'use client';

import { useActionState, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SubmitButton } from './submit-button';
import { updateAtleta } from '../../actions/atleta.actions';
import { initialActionState } from '@/types/action-result';
import { MapPin, Scale, UserCog, Save, UserCheck, AlertTriangle } from 'lucide-react';
import { CategoriaPesoValues, type CategoriaPeso, MUNICIPIOS_CLUB, CLUBES_POR_MUNICIPIO, type MunicipioClub } from '@/types/enums';
import type { AtletaDetalle } from '@/features/entrenador/types/entrenador.types';
import { formatDateForInput, calcularEdad } from '@/lib/date-utils';
import {
  validarPesoCategoria,
  getRangoTexto,
  NOMBRES_CATEGORIA_PESO,
} from '@/lib/peso-utils';

interface Entrenador {
  id: string;
  nombreCompleto: string;
}

interface EditAtletaFormProps {
  atleta: AtletaDetalle;
  entrenadores: Entrenador[];
}

// Formulario para editar un atleta existente
export function EditAtletaForm({ atleta, entrenadores }: EditAtletaFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);

  // Bind del action con el ID del atleta
  const updateWithId = updateAtleta.bind(null, atleta.id);
  const [state, formAction] = useActionState(updateWithId, initialActionState);

  // Estados controlados para fecha de nacimiento y edad (calculo automatico)
  const [fechaNacimiento, setFechaNacimiento] = useState<string>(
    formatDateForInput(atleta.fechaNacimiento)
  );
  const [edad, setEdad] = useState<string>(String(atleta.edad));
  const [edadAutoCalculada, setEdadAutoCalculada] = useState<boolean>(false);

  const [selectedCategoriaPeso, setSelectedCategoriaPeso] = useState<CategoriaPeso | ''>(
    (atleta.categoriaPeso as CategoriaPeso) || ''
  );
  const [pesoActual, setPesoActual] = useState<string>(
    atleta.pesoActual ? String(atleta.pesoActual) : ''
  );
  const [selectedEntrenador, setSelectedEntrenador] = useState(atleta.entrenadorAsignado?.id || '');
  const [estadoActivo, setEstadoActivo] = useState(atleta.usuario.estado);

  // Estados para selects dependientes de municipio y club
  const [selectedMunicipioClub, setSelectedMunicipioClub] = useState<MunicipioClub | ''>(
    (atleta.municipioClub as MunicipioClub) || ''
  );
  const [selectedClub, setSelectedClub] = useState<string>(atleta.club || '');

  // Obtener clubes filtrados por municipio seleccionado
  const clubesDisponibles = useMemo(() => {
    if (!selectedMunicipioClub) return [];
    return CLUBES_POR_MUNICIPIO[selectedMunicipioClub] || [];
  }, [selectedMunicipioClub]);

  // Variable para controlar si es el primer render (para no resetear valores al cargar)
  const isFirstRender = useRef(true);
  const isFirstRenderEdad = useRef(true);

  // Cuando cambia el municipio, resetear el club seleccionado (excepto en el primer render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSelectedClub('');
  }, [selectedMunicipioClub]);

  // Calcular edad automaticamente cuando cambie la fecha de nacimiento (excepto en el primer render)
  useEffect(() => {
    if (isFirstRenderEdad.current) {
      isFirstRenderEdad.current = false;
      return;
    }
    if (fechaNacimiento) {
      const edadCalculada = calcularEdad(fechaNacimiento);
      if (edadCalculada >= 0 && edadCalculada <= 100) {
        setEdad(String(edadCalculada));
        setEdadAutoCalculada(true);
      }
    }
  }, [fechaNacimiento]);

  // Validacion de peso vs categoria en tiempo real
  const validacionPeso = useMemo(() => {
    const peso = pesoActual ? parseFloat(pesoActual) : null;
    const categoria = selectedCategoriaPeso || null;
    return validarPesoCategoria(peso, categoria as CategoriaPeso | null);
  }, [pesoActual, selectedCategoriaPeso]);

  // Obtener el rango de peso como placeholder
  const placeholderPeso = useMemo(() => {
    if (!selectedCategoriaPeso) return 'Ej: 72.5';
    const rango = getRangoTexto(selectedCategoriaPeso as CategoriaPeso);
    return `Rango: ${rango}`;
  }, [selectedCategoriaPeso]);

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Atleta actualizado', {
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

  // Restaurar valores de estados controlados si hay error
  useEffect(() => {
    if (!state.success && state.submittedData) {
      if (state.submittedData.fechaNacimiento) {
        setFechaNacimiento(String(state.submittedData.fechaNacimiento));
      }
      if (state.submittedData.edad) {
        setEdad(String(state.submittedData.edad));
        setEdadAutoCalculada(false);
      }
      if (state.submittedData.categoriaPeso) {
        setSelectedCategoriaPeso(state.submittedData.categoriaPeso as CategoriaPeso);
      }
      if (state.submittedData.pesoActual) {
        setPesoActual(String(state.submittedData.pesoActual));
      }
      if (state.submittedData.entrenadorAsignadoId) {
        setSelectedEntrenador(String(state.submittedData.entrenadorAsignadoId));
      }
      if (state.submittedData.municipioClub) {
        setSelectedMunicipioClub(state.submittedData.municipioClub as MunicipioClub);
      }
      if (state.submittedData.club) {
        setSelectedClub(String(state.submittedData.club));
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Seccion: Datos Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Datos Personales
          </CardTitle>
          <CardDescription>Informacion personal del atleta (datos de usuario no editables)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className={getFieldError('fechaNacimiento') ? 'border-destructive' : ''}
            />
            {getFieldError('fechaNacimiento') && (
              <p className="text-sm text-destructive">{getFieldError('fechaNacimiento')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edad">
              Edad
              {edadAutoCalculada && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (calculada automaticamente)
                </span>
              )}
            </Label>
            <Input
              type="number"
              id="edad"
              name="edad"
              placeholder="Se calcula al cambiar fecha"
              min={5}
              value={edad}
              onChange={(e) => {
                setEdad(e.target.value);
                setEdadAutoCalculada(false);
              }}
              className={`${getFieldError('edad') ? 'border-destructive' : ''} ${edadAutoCalculada ? 'bg-muted/50' : ''}`}
            />
            {getFieldError('edad') && (
              <p className="text-sm text-destructive">{getFieldError('edad')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipio">Municipio</Label>
            <Input
              type="text"
              id="municipio"
              name="municipio"
              defaultValue={getPreviousValue('municipio', atleta.municipio)}
              className={getFieldError('municipio') ? 'border-destructive' : ''}
            />
            {getFieldError('municipio') && (
              <p className="text-sm text-destructive">{getFieldError('municipio')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Telefono</Label>
            <Input
              type="tel"
              id="telefono"
              name="telefono"
              defaultValue={getPreviousValue('telefono', atleta.telefono || '')}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input
              type="text"
              id="direccion"
              name="direccion"
              defaultValue={getPreviousValue('direccion', atleta.direccion || '')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Datos Deportivos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Datos Deportivos
          </CardTitle>
          <CardDescription>Informacion deportiva del atleta</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Municipio del Club *</Label>
            <Select
              value={selectedMunicipioClub}
              onValueChange={(value) => setSelectedMunicipioClub(value as MunicipioClub)}
            >
              <SelectTrigger className={getFieldError('municipioClub') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona el municipio" />
              </SelectTrigger>
              <SelectContent>
                {MUNICIPIOS_CLUB.map((mun) => (
                  <SelectItem key={mun} value={mun}>
                    {mun}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="municipioClub" value={selectedMunicipioClub} />
            {getFieldError('municipioClub') && (
              <p className="text-sm text-destructive">{getFieldError('municipioClub')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Club *</Label>
            <Select
              value={selectedClub}
              onValueChange={setSelectedClub}
              disabled={!selectedMunicipioClub}
            >
              <SelectTrigger className={getFieldError('club') ? 'border-destructive' : ''}>
                <SelectValue placeholder={selectedMunicipioClub ? 'Selecciona el club' : 'Primero selecciona municipio'} />
              </SelectTrigger>
              <SelectContent>
                {clubesDisponibles.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="club" value={selectedClub} />
            {getFieldError('club') && (
              <p className="text-sm text-destructive">{getFieldError('club')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              type="text"
              id="categoria"
              name="categoria"
              defaultValue={getPreviousValue('categoria', atleta.categoria)}
              className={getFieldError('categoria') ? 'border-destructive' : ''}
            />
            {getFieldError('categoria') && (
              <p className="text-sm text-destructive">{getFieldError('categoria')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaPeso">Categoria de Peso *</Label>
            <Select
              value={selectedCategoriaPeso}
              onValueChange={(value) => setSelectedCategoriaPeso(value as CategoriaPeso)}
            >
              <SelectTrigger className={getFieldError('categoriaPeso') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona categoria" />
              </SelectTrigger>
              <SelectContent>
                {CategoriaPesoValues.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {NOMBRES_CATEGORIA_PESO[cat as CategoriaPeso]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="categoriaPeso" value={selectedCategoriaPeso} />
            {getFieldError('categoriaPeso') && (
              <p className="text-sm text-destructive">{getFieldError('categoriaPeso')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pesoActual">Peso Actual (kg)</Label>
            <Input
              type="number"
              id="pesoActual"
              name="pesoActual"
              placeholder={placeholderPeso}
              step="0.1"
              value={pesoActual}
              onChange={(e) => setPesoActual(e.target.value)}
              className={!validacionPeso.valido ? 'border-yellow-500' : ''}
            />
            {!validacionPeso.valido && validacionPeso.mensaje && (
              <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{validacionPeso.mensaje}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Entrenador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Asignacion de Entrenador
          </CardTitle>
          <CardDescription>Cambia el entrenador asignado al atleta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="entrenadorAsignadoId">Entrenador</Label>
            <Select
              value={selectedEntrenador}
              onValueChange={setSelectedEntrenador}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un entrenador" />
              </SelectTrigger>
              <SelectContent>
                {entrenadores.map((ent) => (
                  <SelectItem key={ent.id} value={ent.id}>
                    {ent.nombreCompleto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="entrenadorAsignadoId" value={selectedEntrenador} />
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Estado del Atleta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Estado del Atleta
          </CardTitle>
          <CardDescription>
            Activa o desactiva el atleta en el sistema. Un atleta desactivado no podra acceder al sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="estado">Atleta Activo</Label>
              <p className="text-sm text-muted-foreground">
                {estadoActivo ? 'El atleta puede acceder al sistema' : 'El atleta no puede acceder al sistema'}
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
