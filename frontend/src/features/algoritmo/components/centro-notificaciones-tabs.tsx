'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, ShieldAlert, Bell } from 'lucide-react';

const TABS = [
  { value: 'recomendaciones', label: 'Recomendaciones', icon: Lightbulb },
  { value: 'alertas', label: 'Alertas', icon: ShieldAlert },
  { value: 'informativas', label: 'Informativas', icon: Bell },
] as const;

type TabValue = (typeof TABS)[number]['value'];

interface CentroNotificacionesTabsProps {
  contadores: {
    recomendaciones: number;
    alertas: number;
    informativas: number;
  };
}

export function CentroNotificacionesTabs({ contadores }: CentroNotificacionesTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentTab = (searchParams.get('tab') as TabValue) || 'recomendaciones';

  const handleTabChange = useCallback(
    (tab: TabValue) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      // Resetear otros filtros al cambiar de tab
      params.delete('page');
      params.delete('estado');
      params.delete('atletaId');
      params.delete('soloNoLeidas');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  return (
    <div className="flex flex-wrap gap-2 border-b pb-4">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.value;
        const count = contadores[tab.value];
        const Icon = tab.icon;

        return (
          <Button
            key={tab.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTabChange(tab.value)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {count > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
