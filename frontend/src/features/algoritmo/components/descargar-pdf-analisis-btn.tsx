'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnalisisRendimiento } from '../types/algoritmo.types';

interface DescargarPDFAnalisisBtnProps {
  analisis: AnalisisRendimiento;
}

// Boton para descargar el PDF de analisis de UN atleta
// Usa dynamic import para cargar jsPDF solo cuando el usuario lo solicita
export function DescargarPDFAnalisisBtn({
  analisis,
}: DescargarPDFAnalisisBtnProps) {
  const [generando, setGenerando] = useState(false);

  async function handleDescargar() {
    setGenerando(true);
    try {
      const { descargarPDFAnalisis } = await import(
        '@/lib/pdf/generar-pdf-analisis'
      );
      await descargarPDFAnalisis(analisis);
    } catch (error) {
      console.error('[DescargarPDFAnalisisBtn] Error al generar PDF:', error);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDescargar}
      disabled={generando}
    >
      {generando ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {generando ? 'Generando...' : 'Descargar PDF'}
    </Button>
  );
}
