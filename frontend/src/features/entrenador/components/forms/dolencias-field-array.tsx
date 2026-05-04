'use client';

import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { TipoLesion } from '@/types/enums';

// Mapeo de tipos de lesion a labels legibles
const tipoLesionLabels: Record<string, string> = {
  MOLESTIA: 'Molestia',
  DOLOR_AGUDO: 'Dolor Agudo',
  LESION_CRONICA: 'Lesion Cronica',
  OTRO: 'Otro',
};

// Tipo para los valores del formulario que contiene dolencias
export interface DolenciaField {
  zona: string;
  nivel: number;
  descripcion: string;
  tipoLesion: string;
}

export interface FormWithDolencias {
  dolencias: DolenciaField[];
}

interface DolenciasFieldArrayProps {
  control: Control<FormWithDolencias>;
  register: UseFormRegister<FormWithDolencias>;
}

export function DolenciasFieldArray({ control, register }: DolenciasFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dolencias',
  });

  const handleAddDolencia = () => {
    append({
      zona: '',
      nivel: 5,
      descripcion: '',
      tipoLesion: 'MOLESTIA',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Dolencias / Molestias
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Registra cualquier dolencia o molestia reportada durante el entrenamiento
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay dolencias registradas
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-lg space-y-4 relative"
            >
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Zona afectada */}
                <div className="space-y-2">
                  <Label htmlFor={`dolencias.${index}.zona`}>Zona Afectada *</Label>
                  <Input
                    id={`dolencias.${index}.zona`}
                    {...register(`dolencias.${index}.zona`, {
                      required: 'La zona es requerida',
                      maxLength: { value: 100, message: 'Maximo 100 caracteres' },
                    })}
                    placeholder="Ej: Rodilla izquierda"
                    maxLength={100}
                  />
                </div>

                {/* Nivel de dolor */}
                <div className="space-y-2">
                  <Label htmlFor={`dolencias.${index}.nivel`}>
                    Nivel de Dolor (1-10) *
                  </Label>
                  <Input
                    id={`dolencias.${index}.nivel`}
                    type="number"
                    {...register(`dolencias.${index}.nivel`, {
                      valueAsNumber: true,
                      required: 'El nivel es requerido',
                      min: { value: 1, message: 'Minimo 1' },
                      max: { value: 10, message: 'Maximo 10' },
                    })}
                    min={1}
                    max={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Molestia leve, 10 = Dolor insoportable
                  </p>
                </div>

                {/* Tipo de lesion */}
                <div className="space-y-2">
                  <Label htmlFor={`dolencias.${index}.tipoLesion`}>Tipo de Lesion</Label>
                  <Select
                    defaultValue={field.tipoLesion || 'MOLESTIA'}
                    onValueChange={(value) => {
                      // Actualizar el valor en el formulario
                      const input = document.getElementById(`dolencias.${index}.tipoLesion-hidden`) as HTMLInputElement;
                      if (input) input.value = value;
                    }}
                  >
                    <SelectTrigger id={`dolencias.${index}.tipoLesion`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TipoLesion).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {tipoLesionLabels[value] || value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="hidden"
                    id={`dolencias.${index}.tipoLesion-hidden`}
                    {...register(`dolencias.${index}.tipoLesion`)}
                    defaultValue={field.tipoLesion || 'MOLESTIA'}
                  />
                </div>

                {/* Descripcion */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`dolencias.${index}.descripcion`}>
                    Descripcion (opcional)
                  </Label>
                  <textarea
                    id={`dolencias.${index}.descripcion`}
                    {...register(`dolencias.${index}.descripcion`, {
                      maxLength: { value: 500, message: 'Maximo 500 caracteres' },
                    })}
                    rows={2}
                    maxLength={500}
                    placeholder="Describe la dolencia con mas detalle..."
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddDolencia}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Dolencia
        </Button>
      </CardContent>
    </Card>
  );
}
