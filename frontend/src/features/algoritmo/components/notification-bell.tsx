'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NotificationBellProps {
  notificacionesNoLeidas: number;
  href: string;
}

// Campana de notificaciones con badge contador
// Se usa en el sidebar o header de cada rol
export function NotificationBell({
  notificacionesNoLeidas,
  href,
}: NotificationBellProps) {
  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href={href}>
        <Bell className="h-5 w-5" />
        {notificacionesNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
            {notificacionesNoLeidas > 99 ? '99+' : notificacionesNoLeidas}
          </span>
        )}
      </Link>
    </Button>
  );
}
