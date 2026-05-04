'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Link as LinkIcon,
  ClipboardList,
  AlertTriangle,
  UserCog,
} from 'lucide-react';

// Acciones rapidas para el dashboard del COMITE_TECNICO
// Es un Client Component porque usa navegacion interactiva
export function AccionesRapidasCT() {
  const acciones = [
    {
      titulo: 'Planificacion',
      descripcion: 'Gestionar macrociclos',
      href: '/comite-tecnico/planificacion',
      icon: Calendar,
      color: 'text-green-500',
    },
    {
      titulo: 'Atletas',
      descripcion: 'Ver todos los atletas',
      href: '/comite-tecnico/atletas',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      titulo: 'Asignaciones',
      descripcion: 'Asignar atletas a microciclos',
      href: '/comite-tecnico/asignaciones',
      icon: LinkIcon,
      color: 'text-purple-500',
    },
    {
      titulo: 'Tests Fisicos',
      descripcion: 'Ver todos los tests',
      href: '/comite-tecnico/tests-fisicos',
      icon: ClipboardList,
      color: 'text-emerald-500',
    },
    {
      titulo: 'Dolencias',
      descripcion: 'Monitorear dolencias activas',
      href: '/comite-tecnico/dolencias',
      icon: AlertTriangle,
      color: 'text-orange-500',
    },
    {
      titulo: 'Entrenadores',
      descripcion: 'Ver entrenadores',
      href: '/comite-tecnico/entrenadores',
      icon: UserCog,
      color: 'text-indigo-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rapidas</CardTitle>
        <CardDescription>Accesos directos a las funciones principales</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                <span className="text-xs text-muted-foreground">{accion.descripcion}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
