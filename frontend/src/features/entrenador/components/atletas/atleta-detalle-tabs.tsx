'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestFisico, RegistroPostEntrenamiento, Dolencia, Microciclo } from '@/features/atleta/types/atleta.types';
import { ClipboardList, Activity, AlertTriangle, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AtletaDetalleTabsProps {
  atletaId: string;
  atletaNombre: string;
  tests: TestFisico[];
  registros: RegistroPostEntrenamiento[];
  dolencias: Dolencia[];
  planificacion: Microciclo[];
}

type TabKey = 'tests' | 'registros' | 'dolencias' | 'planificacion';

// Componente de tabs interactivo para ver el detalle de un atleta
export function AtletaDetalleTabs({
  atletaId,
  atletaNombre,
  tests,
  registros,
  dolencias,
  planificacion,
}: AtletaDetalleTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('tests');

  const tabs: { key: TabKey; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'tests', label: 'Tests Fisicos', icon: ClipboardList, count: tests.length },
    { key: 'registros', label: 'Registros', icon: Activity, count: registros.length },
    { key: 'dolencias', label: 'Dolencias', icon: AlertTriangle, count: dolencias.filter(d => !d.recuperado).length },
    { key: 'planificacion', label: 'Planificacion', icon: Calendar, count: planificacion.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/entrenador/mis-atletas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{atletaNombre}</h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant={activeTab === tab.key ? 'secondary' : 'outline'} className="ml-1">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'tests' && <TestsTab tests={tests} />}
        {activeTab === 'registros' && <RegistrosTab registros={registros} />}
        {activeTab === 'dolencias' && <DolenciasTab dolencias={dolencias} />}
        {activeTab === 'planificacion' && <PlanificacionTab planificacion={planificacion} />}
      </div>
    </div>
  );
}

// Sub-componente para mostrar tests
function TestsTab({ tests }: { tests: TestFisico[] }) {
  if (tests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay tests registrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tests.map((test) => (
        <Card key={test.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Test del {new Date(test.fechaTest).toLocaleDateString('es-ES')}</span>
              {test.navetteVO2max && (
                <Badge variant="outline">VO2max: {test.navetteVO2max}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {test.pressBanca && (
                <div>
                  <p className="text-muted-foreground">Press Banca</p>
                  <p className="font-medium">{test.pressBanca} kg</p>
                </div>
              )}
              {test.tiron && (
                <div>
                  <p className="text-muted-foreground">Tiron</p>
                  <p className="font-medium">{test.tiron} kg</p>
                </div>
              )}
              {test.sentadilla && (
                <div>
                  <p className="text-muted-foreground">Sentadilla</p>
                  <p className="font-medium">{test.sentadilla} kg</p>
                </div>
              )}
              {test.barraFija !== null && (
                <div>
                  <p className="text-muted-foreground">Barra Fija</p>
                  <p className="font-medium">{test.barraFija} reps</p>
                </div>
              )}
              {test.paralelas !== null && (
                <div>
                  <p className="text-muted-foreground">Paralelas</p>
                  <p className="font-medium">{test.paralelas} reps</p>
                </div>
              )}
              {test.navettePalier && (
                <div>
                  <p className="text-muted-foreground">Navette</p>
                  <p className="font-medium">Palier {test.navettePalier}</p>
                </div>
              )}
            </div>
            {test.observaciones && (
              <p className="mt-3 text-sm text-muted-foreground">{test.observaciones}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Sub-componente para mostrar registros
function RegistrosTab({ registros }: { registros: RegistroPostEntrenamiento[] }) {
  if (registros.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay registros post-entrenamiento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {registros.map((registro) => (
        <Card key={registro.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>
                {new Date(registro.fechaRegistro).toLocaleDateString('es-ES')}
                {registro.sesion && ` - Sesion ${registro.sesion.numeroSesion}`}
              </span>
              <div className="flex gap-2">
                <Badge variant={registro.asistio ? 'default' : 'destructive'}>
                  {registro.asistio ? 'Asistio' : 'Falta'}
                </Badge>
                <Badge variant="outline">RPE: {registro.rpe}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ejercicios</p>
                <p className="font-medium">{registro.ejerciciosCompletados}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Intensidad</p>
                <p className="font-medium">{registro.intensidadAlcanzada}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sueno</p>
                <p className="font-medium">{registro.calidadSueno}/10</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado Animico</p>
                <p className="font-medium">{registro.estadoAnimico}/10</p>
              </div>
            </div>
            {registro.dolencias && registro.dolencias.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Dolencias reportadas:</p>
                <div className="flex flex-wrap gap-2">
                  {registro.dolencias.map((d) => (
                    <Badge key={d.id} variant="destructive">
                      {d.zona} (nivel {d.nivel})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Sub-componente para mostrar dolencias
function DolenciasTab({ dolencias }: { dolencias: Dolencia[] }) {
  const activas = dolencias.filter((d) => !d.recuperado);
  const recuperadas = dolencias.filter((d) => d.recuperado);

  if (dolencias.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay dolencias registradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activas.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Dolencias Activas ({activas.length})
          </h3>
          <div className="space-y-3">
            {activas.map((dolencia) => (
              <Card key={dolencia.id} className="border-orange-200">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dolencia.zona}</p>
                      <p className="text-sm text-muted-foreground">
                        Nivel: {dolencia.nivel}/10 - {dolencia.tipoLesion?.replace('_', ' ') || 'Sin tipo'}
                      </p>
                      {dolencia.descripcion && (
                        <p className="text-sm mt-1">{dolencia.descripcion}</p>
                      )}
                    </div>
                    <Badge variant="destructive">Activa</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {recuperadas.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 text-muted-foreground">
            Dolencias Recuperadas ({recuperadas.length})
          </h3>
          <div className="space-y-3">
            {recuperadas.map((dolencia) => (
              <Card key={dolencia.id} className="opacity-60">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dolencia.zona}</p>
                      <p className="text-sm text-muted-foreground">
                        Nivel: {dolencia.nivel}/10 - Recuperada el{' '}
                        {dolencia.fechaRecuperacion
                          ? new Date(dolencia.fechaRecuperacion).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="outline">Recuperada</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componente para mostrar planificacion
function PlanificacionTab({ planificacion }: { planificacion: Microciclo[] }) {
  if (planificacion.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay planificacion asignada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {planificacion.map((micro) => (
        <Card key={micro.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Microciclo {micro.codigoMicrociclo}</span>
              <Badge variant="outline">{micro.tipoMicrociclo?.replace('_', ' ')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Inicio</p>
                <p className="font-medium">
                  {new Date(micro.fechaInicio).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fin</p>
                <p className="font-medium">
                  {new Date(micro.fechaFin).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Volumen</p>
                <p className="font-medium">{micro.volumenTotal}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Intensidad</p>
                <p className="font-medium">{micro.intensidadPromedio}%</p>
              </div>
            </div>
            {micro.objetivoSemanal && (
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">Objetivo: </span>
                {micro.objetivoSemanal}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
