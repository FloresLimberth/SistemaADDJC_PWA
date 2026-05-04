'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  usuarioFormSchema,
  crearAtletaAdminSchema,
  crearEntrenadorAdminSchema,
  rolesUsuario,
  type UsuarioFormInput,
  type Usuario,
  type CrearAtletaAdminInput,
  type CrearEntrenadorAdminInput,
} from '@/lib/usuarios-schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { crearUsuarioAction } from '../_actions/crear-usuario';
import { crearAtletaAction } from '../_actions/crear-atleta';
import { crearEntrenadorAction } from '../_actions/crear-entrenador';
import { editarUsuarioAction } from '../_actions/editar-usuario';
import { toast } from 'sonner';
import { CategoriaPesoValues } from '@/types/enums';
import { Scale, MapPin } from 'lucide-react';

interface UsuarioFormProps {
  usuario?: Usuario;
  onSuccess?: () => void;
}

export function UsuarioForm({ usuario, onSuccess }: UsuarioFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [selectedRol, setSelectedRol] = useState<string>('ATLETA');
  const isEditing = !!usuario;

  // Determinar el schema según el rol seleccionado
  const getSchema = () => {
    if (isEditing) return usuarioFormSchema;

    if (selectedRol === 'ATLETA') return crearAtletaAdminSchema;
    if (selectedRol === 'ENTRENADOR') return crearEntrenadorAdminSchema;
    return usuarioFormSchema;
  };

  // Tipo dinamico necesario debido a los multiples esquemas posibles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(getSchema()),
    defaultValues: usuario
      ? {
          ci: usuario.ci,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          contrasena: '',
          rol: usuario.rol,
          estado: usuario.estado,
        }
      : {
          ci: '',
          nombreCompleto: '',
          email: '',
          contrasena: '',
          rol: 'ATLETA',
          estado: true,
          // Campos adicionales para atleta
          municipio: '',
          club: '',
          categoria: '',
          fechaNacimiento: '',
          edad: 0,
          categoriaPeso: '',
        },
  });

  // Actualizar el rol seleccionado cuando cambie en el formulario
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.rol && typeof value.rol === 'string') {
        setSelectedRol(value.rol);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsPending(true);

    try {
      let result;

      if (isEditing) {
        // Si estamos editando, solo enviamos los campos modificados
        const updateData: Record<string, unknown> = {};

        if (data.ci !== usuario.ci) updateData.ci = data.ci;
        if (data.nombreCompleto !== usuario.nombreCompleto)
          updateData.nombreCompleto = data.nombreCompleto;
        if (data.email !== usuario.email) updateData.email = data.email;
        if (data.contrasena) updateData.contrasena = data.contrasena;
        if (data.rol !== usuario.rol) updateData.rol = data.rol;
        if (data.estado !== usuario.estado) updateData.estado = data.estado;

        result = await editarUsuarioAction(usuario.id, updateData);
      } else {
        // Si estamos creando, determinar qué action usar según el rol
        if (data.rol === 'ATLETA') {
          result = await crearAtletaAction(data as CrearAtletaAdminInput);
        } else if (data.rol === 'ENTRENADOR') {
          result = await crearEntrenadorAction(
            data as CrearEntrenadorAdminInput
          );
        } else {
          // Para ADMINISTRADOR y COMITE_TECNICO usar la action normal
          result = await crearUsuarioAction(data as UsuarioFormInput);
        }
      }

      if (result.success) {
        toast.success(
          isEditing
            ? `Usuario ${data.nombreCompleto} actualizado`
            : `Usuario ${data.nombreCompleto} creado`,
          {
            description: isEditing
              ? 'Los cambios se han guardado correctamente'
              : 'El usuario ha sido creado exitosamente',
          }
        );

        if (!isEditing) {
          form.reset();
        }
        onSuccess?.();
      } else {
        toast.error(result.error || 'Error desconocido', {
          description: 'Por favor intenta nuevamente',
        });
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'No pudimos procesar tu solicitud',
      });
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  // Determinar si mostrar campos adicionales
  const showAtletaFields = !isEditing && selectedRol === 'ATLETA';
  const showEntrenadorFields = !isEditing && selectedRol === 'ENTRENADOR';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos basicos del usuario */}
        <div className="space-y-4">
          {/* CI */}
          <FormField
            control={form.control}
            name="ci"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CI *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 12345678"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre Completo */}
          <FormField
            control={form.control}
            name="nombreCompleto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Juan Perez Rodriguez"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Ej: usuario@addjc.com"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contraseña */}
          <FormField
            control={form.control}
            name="contrasena"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={
                      isEditing
                        ? 'Dejar en blanco para no cambiar'
                        : 'Mínimo 8 caracteres'
                    }
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rol */}
          <FormField
            control={form.control}
            name="rol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending || isEditing}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rolesUsuario.map((rol) => (
                      <SelectItem key={rol} value={rol}>
                        {rol.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {!isEditing && (
                  <FormDescription>
                    Los campos adicionales cambiarán según el rol seleccionado
                  </FormDescription>
                )}
              </FormItem>
            )}
          />

          {/* Estado */}
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Estado</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {field.value ? 'Usuario activo' : 'Usuario inactivo'}
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Seccion de datos del atleta */}
        {showAtletaFields && (
          <>
            <Separator className="my-6" />
            <div className="space-y-1 mb-4">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Datos Personales
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Municipio */}
              <FormField
                control={form.control}
                name="municipio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Municipio *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Cochabamba"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha de Nacimiento */}
              <FormField
                control={form.control}
                name="fechaNacimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Edad */}
              <FormField
                control={form.control}
                name="edad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 18"
                        min={5}
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />
            <div className="space-y-1 mb-4">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Datos Deportivos
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Club */}
              <FormField
                control={form.control}
                name="club"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Club ADDJC"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoría */}
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Senior, Juvenil, Cadete"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoría de Peso */}
              <FormField
                control={form.control}
                name="categoriaPeso"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Categoría de Peso *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CategoriaPesoValues.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* Seccion de datos del entrenador */}
        {showEntrenadorFields && (
          <>
            <Separator className="my-6" />
            <div className="space-y-1 mb-4">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Datos del Entrenador
              </p>
            </div>

            <div className="space-y-4">
              {/* Municipio */}
              <FormField
                control={form.control}
                name="municipio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Municipio *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Cochabamba"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* Boton de envio */}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? isEditing
              ? 'Actualizando...'
              : 'Creando...'
            : isEditing
              ? 'Actualizar Usuario'
              : 'Crear Usuario'}
        </Button>
      </form>
    </Form>
  );
}
