'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { SesionParaSelector } from '../../actions/fetch-sesiones';

interface SelectSesionProps {
  sesiones: SesionParaSelector[];
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

// Selector de sesiones para formularios
export function SelectSesion({
  sesiones,
  value,
  onValueChange,
  error,
  disabled,
}: SelectSesionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sesionId" className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Sesion *
      </Label>
      <Select
        name="sesionId"
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="sesionId" className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder="Selecciona una sesion" />
        </SelectTrigger>
        <SelectContent>
          {sesiones.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No hay sesiones disponibles
            </div>
          ) : (
            sesiones.map((sesion) => (
              <SelectItem key={sesion.id} value={sesion.id}>
                {sesion.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
