import {
  Home,
  Users,
  Calendar,
  Trophy,
  Clipboard,
  Activity,
  BarChart,
  Bell,
  Heart,
  AlertTriangle,
  UserCog,

  CalendarClock,
  Medal,
  LineChart,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RolUsuario } from '@/types/auth';

export interface NavigationSubItem {
  href: string;
  label: string;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavigationSubItem[];
  badgeKey?: string;
}

export const navigationConfig: Record<RolUsuario, NavigationItem[]> = {
  ADMINISTRADOR: [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/admin/usuarios',
      label: 'Usuarios',
      icon: Users,
    },
    {
      href: '/admin/actividad',
      label: 'Actividad',
      icon: Activity,
    },
  ],

  COMITE_TECNICO: [
    {
      href: '/comite-tecnico',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/comite-tecnico/atletas',
      label: 'Atletas',
      icon: Trophy,
    },
    {
      href: '/comite-tecnico/entrenadores',
      label: 'Entrenadores',
      icon: UserCog,
    },
    {
      href: '/comite-tecnico/planificacion',
      label: 'Calendario',
      icon: Calendar,
    },
    {
      href: '/comite-tecnico/sesiones',
      label: 'Sesiones',
      icon: CalendarClock,
    },
    {
      href: '/comite-tecnico/tests-fisicos',
      label: 'Tests Fisicos',
      icon: Clipboard,
    },
    {
      href: '/comite-tecnico/estadisticas',
      label: 'Estadisticas',
      icon: BarChart,
    },
    {
      href: '/comite-tecnico/post-entrenamiento',
      label: 'Post-Entrenamiento',
      icon: Activity,
    },
    {
      href: '/comite-tecnico/dolencias',
      label: 'Dolencias',
      icon: AlertTriangle,
    },
    {
      href: '/comite-tecnico/ranking',
      label: 'Ranking',
      icon: Medal,
    },
    {
      href: '/comite-tecnico/centro-notificaciones',
      label: 'Recomendaciones',
      icon: Bell,
      badgeKey: 'centroNotificaciones',
    },
    {
      href: '/comite-tecnico/analisis',
      label: 'Analisis',
      icon: LineChart,
    },
    {
      href: '/comite-tecnico/catalogo-ejercicios',
      label: 'Catalogo Ejercicios',
      icon: BookOpen,
    },
  ],

  ENTRENADOR: [
    {
      href: '/entrenador',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/entrenador/mis-atletas',
      label: 'Mis Atletas',
      icon: Trophy,
    },
    {
      href: '/entrenador/planificacion',
      label: 'Calendario',
      icon: Calendar,
    },
    {
      href: '/entrenador/sesiones',
      label: 'Sesiones',
      icon: CalendarClock,
    },
    {
      href: '/entrenador/tests-fisicos',
      label: 'Tests Fisicos',
      icon: Clipboard,
    },
    {
      href: '/entrenador/post-entrenamiento',
      label: 'Post-Entrenamiento',
      icon: Activity,
    },
    {
      href: '/entrenador/dolencias',
      label: 'Dolencias',
      icon: AlertTriangle,
    },
    {
      href: '/entrenador/estadisticas',
      label: 'Estadisticas',
      icon: BarChart,
    },
    {
      href: '/entrenador/ranking',
      label: 'Ranking',
      icon: Medal,
    },
    {
      href: '/entrenador/centro-notificaciones',
      label: 'Recomendaciones',
      icon: Bell,
      badgeKey: 'centroNotificaciones',
    },
    {
      href: '/entrenador/analisis',
      label: 'Analisis',
      icon: LineChart,
    },
  ],

  ATLETA: [
    {
      href: '/atleta',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/atleta/tests',
      label: 'Tests Fisicos',
      icon: Activity,
    },
    {
      href: '/atleta/planificacion',
      label: 'Mi Plan',
      icon: Calendar,
    },
    {
      href: '/atleta/progreso',
      label: 'Mi Progreso',
      icon: BarChart,
    },
    {
      href: '/atleta/dolencias',
      label: 'Mis Dolencias',
      icon: Heart,
    },
    {
      href: '/atleta/ranking',
      label: 'Mi Ranking',
      icon: Medal,
    },
    {
      href: '/atleta/analisis',
      label: 'Mi Analisis',
      icon: LineChart,
    },
    {
      href: '/atleta/notificaciones',
      label: 'Notificaciones',
      icon: Bell,
    },
  ],
};
