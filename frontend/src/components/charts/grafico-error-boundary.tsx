'use client';

import { Component, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GraficoErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Error al renderizar el grafico
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Ocurrio un error inesperado. Intenta recargar la pagina.
          </p>
        </CardContent>
      );
    }

    return this.props.children;
  }
}
