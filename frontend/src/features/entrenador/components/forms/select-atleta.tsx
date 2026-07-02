'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface Atleta {
  id: string;
  nombreCompleto: string;
}

interface SelectAtletaProps {
  atletas: Atleta[];
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

// Selector de atletas para formularios
export function SelectAtleta({
  atletas,
  value,
  onValueChange,
  error,
  disabled,
}: SelectAtletaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="atletaId" className="flex items-center gap-2">
        <User className="h-4 w-4" />
        Atleta *
      </Label>
      <Select
        name="atletaId"
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="atletaId" className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder="Selecciona un atleta" />
        </SelectTrigger>
        <SelectContent>
          {atletas.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No tienes atletas asignados
            </div>
          ) : (
            atletas.map((atleta) => (
              <SelectItem key={atleta.id} value={atleta.id}>
                {atleta.nombreCompleto}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
