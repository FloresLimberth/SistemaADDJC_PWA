'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Datos minimos por atleta que necesita el boton
// Identificacion garantizada para que la hoja resumen siempre tenga algo que mostrar
// (incluso si los 4 fetches de un atleta fallan)
interface AtletaParaPDF {
  id: string;
  nombreCompleto: string;
  categoriaPeso: string;
}

interface DescargarPDFGrupalBtnProps {
  atletas: AtletaParaPDF[];
  // Ventana de análisis en días - lo pasa la página padre desde el selector
  // para que el PDF respete el mismo rango que el usuario está viendo en pantalla
  dias: number;
}

// Boton para descargar el PDF de analisis de TODOS los atletas
// Para cada atleta hace 4 fetches en paralelo (analisis + ranking + dolencias + recomendaciones)
// y compone un objeto DatosAtletaParaPDFGrupal por atleta antes de generar el PDF
// Usa Promise.allSettled para que un fallo aislado no tumbe el reporte completo
export function DescargarPDFGrupalBtn({
  atletas,
  dias,
}: DescargarPDFGrupalBtnProps) {
  const [generando, setGenerando] = useState(false);
  const [progreso, setProgreso] = useState('');

  async function handleDescargar() {
    if (atletas.length === 0) return;

    setGenerando(true);
    setProgreso('Obteniendo datos...');

    try {
      // Cargas dinamicas para no inflar el bundle inicial
      const { fetchAnalisisRendimiento } = await import(
        '@/features/algoritmo/actions/fetch-analisis'
      );
      const { fetchRankingAtleta } = await import(
        '@/features/algoritmo/actions/fetch-ranking'
      );
      const { fetchRecomendaciones } = await import(
        '@/features/algoritmo/actions/fetch-recomendaciones'
      );
      const { fetchDolenciasActivasPorAtleta } = await import(
        '@/features/entrenador/actions/fetch-dolencias-entrenador'
      );
      const { descargarPDFAnalisisGrupal } = await import(
        '@/lib/pdf/generar-pdf-analisis'
      );

      // Por cada atleta lanzamos 4 fetches en paralelo con allSettled
      // para que un fallo aislado (ej. ranking sin datos) no tumbe el resto
      // Filtramos las recomendaciones a estados accionables (PENDIENTE + EN_PROCESO)
      // dado que el endpoint solo acepta un estado a la vez, traemos todas con limit
      // alto y filtramos en memoria
      const resultados = await Promise.all(
        atletas.map(async (atleta) => {
          const [analisisRes, rankingRes, dolenciasRes, recomendacionesRes] =
            await Promise.allSettled([
              fetchAnalisisRendimiento(atleta.id, dias),
              fetchRankingAtleta(atleta.id),
              fetchDolenciasActivasPorAtleta(atleta.id),
              fetchRecomendaciones({ atletaId: atleta.id, limit: 100 }),
            ]);

          const analisis =
            analisisRes.status === 'fulfilled' ? analisisRes.value : null;
          const ranking =
            rankingRes.status === 'fulfilled' ? rankingRes.value : null;
          const dolencias =
            dolenciasRes.status === 'fulfilled' && dolenciasRes.value !== null
              ? dolenciasRes.value
              : [];
          const recomendaciones =
            recomendacionesRes.status === 'fulfilled' &&
            recomendacionesRes.value !== null
              ? recomendacionesRes.value.data.filter(
                  (r) => r.estado === 'PENDIENTE' || r.estado === 'EN_PROCESO'
                )
              : [];

          return {
            atletaId: atleta.id,
            nombreCompleto: atleta.nombreCompleto,
            categoriaPeso: atleta.categoriaPeso,
            analisis,
            ranking,
            dolenciasActivas: dolencias,
            recomendacionesPendientes: recomendaciones,
          };
        })
      );

      setProgreso(`Generando PDF (${resultados.length} atletas)...`);
      await descargarPDFAnalisisGrupal(resultados);
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
