'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardPlus, FileText, Activity, Users } from 'lucide-react';

// Acciones rapidas para el dashboard del entrenador
// Es un Client Component porque usa navegacion interactiva
export function AccionesRapidas() {
  const acciones = [
    {
      titulo: 'Nuevo Test Fisico',
      descripcion: 'Registrar test de un atleta',
      href: '/entrenador/tests-fisicos/nuevo',
      icon: ClipboardPlus,
      color: 'text-green-500',
    },
    {
      titulo: 'Post-Entrenamiento',
      descripcion: 'Registrar datos de sesion',
      href: '/entrenador/post-entrenamiento/nuevo',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      titulo: 'Ver Dolencias',
      descripcion: 'Gestionar dolencias activas',
      href: '/entrenador/dolencias',
      icon: Activity,
      color: 'text-orange-500',
    },
    {
      titulo: 'Mis Atletas',
      descripcion: 'Ver lista completa',
      href: '/entrenador/mis-atletas',
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rapidas</CardTitle>
        <CardDescription>
          Accesos directos a las funciones mas usadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {acciones.map((accion) => (
            <Button
              key={accion.href}
              variant="outline"
              className="h-auto flex flex-col items-start p-4 gap-1"
              asChild
            >
              <Link href={accion.href}>
                <accion.icon className={`h-5 w-5 ${accion.color}`} />
                <span className="font-medium">{accion.titulo}</span>
                <span className="text-xs text-muted-foreground">
                  {accion.descripcion}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
