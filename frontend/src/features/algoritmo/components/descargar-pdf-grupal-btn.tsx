'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AtletaParaPDF {
  id: string;
}

interface DescargarPDFGrupalBtnProps {
  atletas: AtletaParaPDF[];
}

// Boton para descargar el PDF de analisis de TODOS los atletas
// Hace fetch de cada atleta en paralelo, luego genera un unico PDF
export function DescargarPDFGrupalBtn({
  atletas,
}: DescargarPDFGrupalBtnProps) {
  const [generando, setGenerando] = useState(false);
  const [progreso, setProgreso] = useState('');

  async function handleDescargar() {
    if (atletas.length === 0) return;

    setGenerando(true);
    setProgreso('Obteniendo datos...');

    try {
      const { fetchAnalisisRendimiento } = await import(
        '@/features/algoritmo/actions/fetch-analisis'
      );
      const { descargarPDFAnalisisGrupal } = await import(
        '@/lib/pdf/generar-pdf-analisis'
      );

      // Obtener analisis de cada atleta en paralelo
      const promesas = atletas.map((a) => fetchAnalisisRendimiento(a.id));
      const resultados = await Promise.all(promesas);

      // Filtrar los que retornaron datos (no null)
      const analisisValidos = resultados.filter(
        (r) => r !== null
      );

      if (analisisValidos.length === 0) {
        setProgreso('No se encontraron datos de analisis');
        setTimeout(() => {
          setGenerando(false);
          setProgreso('');
        }, 2000);
        return;
      }

      setProgreso(`Generando PDF (${analisisValidos.length} atletas)...`);
      await descargarPDFAnalisisGrupal(analisisValidos);
    } catch (error) {
      console.error('[DescargarPDFGrupalBtn] Error:', error);
      setProgreso('Error al generar PDF');
      setTimeout(() => {
        setProgreso('');
      }, 2000);
    } finally {
      setGenerando(false);
      setProgreso('');
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDescargar}
      disabled={generando || atletas.length === 0}
    >
      {generando ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {progreso || 'Descargar todos (PDF)'}
    </Button>
  );
}
