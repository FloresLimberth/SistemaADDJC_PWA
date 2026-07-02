'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth.actions';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { KimonoIcon } from '@/components/ui/kimono-icon';
import { navigationConfig } from '@/lib/navigation';
import type { Usuario } from '@/types/auth';

interface AppSidebarProps {
  user: Usuario;
  badgeCounts?: Record<string, number>;
}

export function AppSidebar({ user, badgeCounts = {} }: AppSidebarProps) {
  const pathname = usePathname();
  const navigation = navigationConfig[user.rol];

  // Estado para controlar que collapsibles estan abiertos
  const [openItems, setOpenItems] = useState<string[]>(() => {
    // Auto-abrir el item que contiene la ruta actual
    const initialOpen: string[] = [];
    navigation.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          pathname.startsWith(child.href)
        );
        if (isChildActive) {
          initialOpen.push(item.href);
        }
      }
    });
    return initialOpen;
  });

  const toggleItem = (href: string) => {
    setOpenItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  return (
    <Sidebar className="w-[260px]">
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <KimonoIcon size={32} className="inline-block" />
          <span className="text-[1.5rem] font-bold text-secondary tracking-tight">
            ADDJC
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {navigation.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openItems.includes(item.href);
                const isActive = pathname === item.href;
                const isChildActive = hasChildren
                  ? item.children!.some((child) => pathname === child.href)
                  : false;
                const isParentActive = isActive || isChildActive;

                // Item con sub-menu (expandible)
                if (hasChildren) {
                  return (
                    <Collapsible
                      key={item.href}
                      open={isOpen}
                      onOpenChange={() => toggleItem(item.href)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`
                              flex items-center gap-3 px-6 py-[0.875rem] my-1 rounded-lg font-medium transition-all duration-300 w-full
                              ${
                                isParentActive
                                  ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-md hover:shadow-lg'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              }
                            `}
                          >
                            <item.icon
                              className="h-5 w-5 flex-shrink-0"
                              strokeWidth={2}
                            />
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 mt-1 border-l-2 border-muted">
                            {item.children!.map((child) => {
                              const isSubActive = pathname === child.href;
                              return (
                                <SidebarMenuSubItem key={child.href}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className={`
                                      py-2 px-4 rounded-md transition-all duration-200
                                      ${
                                        isSubActive
                                          ? 'bg-primary/10 text-primary font-medium'
                                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                      }
                                    `}
                                  >
                                    <Link href={child.href}>
                                      <span>{child.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Item simple (sin sub-menu)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        flex items-center gap-3 px-6 py-[0.875rem] my-1 rounded-lg font-medium transition-all duration-300
                        ${
                          isActive
                            ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-md hover:shadow-lg'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon
                          className="h-5 w-5 flex-shrink-0"
                          strokeWidth={2}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badgeKey && badgeCounts[item.badgeKey] > 0 && (
                          <span
                            className={`
                              inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full
                              ${isActive ? 'bg-white text-primary' : 'bg-red-500 text-white'}
                            `}
                          >
                            {badgeCounts[item.badgeKey] > 99
                              ? '99+'
                              : badgeCounts[item.badgeKey]}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <button
          onClick={() => logoutAction()}
          className="flex items-center gap-3 px-4 py-[0.875rem] text-danger font-medium rounded-lg transition-all duration-300 hover:bg-danger/10 w-full"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
          <span>Cerrar sesion</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
