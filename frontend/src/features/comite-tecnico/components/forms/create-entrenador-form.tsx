'use client';

import { useActionState, useEffect, useRef } from 'react';
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
import { SubmitButton } from './submit-button';
import { createEntrenador } from '../../actions/entrenador.actions';
import { initialActionState } from '@/types/action-result';
import { User, MapPin, UserPlus } from 'lucide-react';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

// Formulario para crear un entrenador
export function CreateEntrenadorForm() {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [state, formAction] = useActionState(
    createEntrenador,
    initialActionState
  );

  // Mostrar toast y redirigir en caso de exito
  useEffect(() => {
    if (state.success && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Entrenador creado', {
        description: state.message,
      });
      router.push(COMITE_TECNICO_ROUTES.entrenadores.list);
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
              className={
                getFieldError('nombreCompleto') ? 'border-destructive' : ''
              }
            />
            {getFieldError('nombreCompleto') && (
              <p className="text-sm text-destructive">
                {getFieldError('nombreCompleto')}
              </p>
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
              <p className="text-sm text-destructive">
                {getFieldError('email')}
              </p>
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
              className={
                getFieldError('contrasena') ? 'border-destructive' : ''
              }
            />
            {getFieldError('contrasena') && (
              <p className="text-sm text-destructive">
                {getFieldError('contrasena')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Datos del Entrenador */}
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
              defaultValue={getPreviousValue('municipio')}
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
              defaultValue={getPreviousValue('especialidad')}
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
        <SubmitButton pendingText="Creando...">
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Entrenador
        </SubmitButton>
      </div>
    </form>
  );
}
