'use client';

import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from './submit-button';
import { createAtleta } from '../../actions/atleta.actions';
import { initialActionState } from '@/types/action-result';
import { User, MapPin, Scale, UserCog, UserPlus, AlertTriangle } from 'lucide-react';
import { CategoriaPesoValues, type CategoriaPeso, MUNICIPIOS_CLUB, CLUBES_POR_MUNICIPIO, type MunicipioClub } from '@/types/enums';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';
import {
  validarPesoCategoria,
  getRangoTexto,
  NOMBRES_CATEGORIA_PESO,
} from '@/lib/peso-utils';
import { calcularEdad } from '@/lib/date-utils';

interface Entrenador {
  id: string;
  nombreCompleto: string;
}

interface CreateAtletaFormProps {
  entrenadores: Entrenador[];
}

// Formulario para crear un atleta
export function CreateAtletaForm({ entrenadores }: CreateAtletaFormProps) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(createAtleta, initialActionState);

  // Estados controlados para fecha de nacimiento y edad (calculo automatico)
  const [fechaNacimiento, setFechaNacimiento] = useState<string>('');
  const [edad, setEdad] = useState<string>('');
  const [edadAutoCalculada, setEdadAutoCalculada] = useState<boolean>(false);

  // Estados controlados para validacion de peso
  const [selectedCategoriaPeso, setSelectedCategoriaPeso] = useState<CategoriaPeso | ''>('');
  const [pesoActual, setPesoActual] = useState<string>('');

  // Estados controlados para selects dependientes de municipio y club
  const [selectedMunicipioClub, setSelectedMunicipioClub] = useState<MunicipioClub | ''>('');
  const [selectedClub, setSelectedClub] = useState<string>('');

  // Obtener clubes filtrados por municipio seleccionado
  const clubesDisponibles = useMemo(() => {
    if (!selectedMunicipioClub) return [];
    return CLUBES_POR_MUNICIPIO[selectedMunicipioClub] || [];
  }, [selectedMunicipioClub]);

  // Cuando cambia el municipio, resetear el club seleccionado
  useEffect(() => {
    setSelectedClub('');
  }, [selectedMunicipioClub]);

  // Calcular edad automaticamente cuando cambie la fecha de nacimiento
  useEffect(() => {
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
      toast.success('Atleta creado', {
        description: state.message,
      });
      router.push(COMITE_TECNICO_ROUTES.atletas.list);
    }
  }, [state, router]);

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
      if (state.submittedData.municipioClub) {
        setSelectedMunicipioClub(state.submittedData.municipioClub as MunicipioClub);
      }
      if (state.submittedData.club) {
        setSelectedClub(String(state.submittedData.club));
      }
    }
  }, [state]);

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

  return (
    <form action={formAction} className="space-y-6">
      {/* Seccion: Datos de Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos de Usuario
          </CardTitle>
          <CardDescription>Informacion de acceso al sistema</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ci">CI (Carnet de Identidad) *</Label>
            <Input
              type="text"
              id="ci"
              name="ci"
              placeholder="Ej: 12345678"
              defaultValue={getPreviousValue('ci')}
              className={getFieldError('ci') ? 'border-destructive' : ''}
            />
            {getFieldError('ci') && (
              <p className="text-sm text-destructive">{getFieldError('ci')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
            <Input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              placeholder="Ej: Juan Perez Garcia"
              defaultValue={getPreviousValue('nombreCompleto')}
              className={getFieldError('nombreCompleto') ? 'border-destructive' : ''}
            />
            {getFieldError('nombreCompleto') && (
              <p className="text-sm text-destructive">{getFieldError('nombreCompleto')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Ej: juan.perez@email.com"
              defaultValue={getPreviousValue('email')}
              className={getFieldError('email') ? 'border-destructive' : ''}
            />
            {getFieldError('email') && (
              <p className="text-sm text-destructive">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">Contrasena *</Label>
            <Input
              type="password"
              id="contrasena"
              name="contrasena"
              placeholder="Minimo 8 caracteres"
              defaultValue={getPreviousValue('contrasena')}
              className={getFieldError('contrasena') ? 'border-destructive' : ''}
            />
            {getFieldError('contrasena') && (
              <p className="text-sm text-destructive">{getFieldError('contrasena')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Datos Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Datos Personales
          </CardTitle>
          <CardDescription>Informacion personal del atleta</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
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
              Edad *
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
              placeholder="Se calcula al ingresar fecha"
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
            <Label htmlFor="municipio">Municipio *</Label>
            <Input
              type="text"
              id="municipio"
              name="municipio"
              placeholder="Ej: Cochabamba"
              defaultValue={getPreviousValue('municipio')}
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
              placeholder="Ej: 70012345"
              defaultValue={getPreviousValue('telefono')}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input
              type="text"
              id="direccion"
              name="direccion"
              placeholder="Ej: Av. America 123"
              defaultValue={getPreviousValue('direccion')}
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
            <p className="text-xs text-muted-foreground">Primero selecciona el municipio del club</p>
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
            <Label htmlFor="categoria">Categoria *</Label>
            <Input
              type="text"
              id="categoria"
              name="categoria"
              placeholder="Ej: Senior, Juvenil, Cadete"
              defaultValue={getPreviousValue('categoria')}
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
          <CardDescription>Asigna un entrenador al atleta (opcional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="entrenadorAsignadoId">Entrenador</Label>
            <Select name="entrenadorAsignadoId" defaultValue={getPreviousValue('entrenadorAsignadoId') || undefined}>
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
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <div className="flex justify-end">
        <SubmitButton pendingText="Creando...">
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Atleta
        </SubmitButton>
      </div>
    </form>
  );
}
