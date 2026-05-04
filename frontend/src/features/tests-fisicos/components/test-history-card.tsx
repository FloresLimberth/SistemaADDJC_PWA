import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TestHistoryCardProps {
  test: any; // Tipo any por ahora, luego usaremos el tipo real
}

// Componente para mostrar una tarjeta individual de un test fisico
export function TestHistoryCard({ test }: TestHistoryCardProps) {
  // Formatear fecha
  const fechaFormateada = format(new Date(test.fechaTest), 'dd MMM yyyy', { locale: es });

  // Agrupar valores por categoria
  const fuerzaMaxima = [];
  if (test.pressBanca) fuerzaMaxima.push({ nombre: 'Press Banca', valor: `${test.pressBanca} kg`, intensidad: test.pressBancaIntensidad });
  if (test.tiron) fuerzaMaxima.push({ nombre: 'Tiron', valor: `${test.tiron} kg`, intensidad: test.tironIntensidad });
  if (test.sentadilla) fuerzaMaxima.push({ nombre: 'Sentadilla', valor: `${test.sentadilla} kg`, intensidad: test.sentadillaIntensidad });

  const fuerzaResistencia = [];
  if (test.barraFija) fuerzaResistencia.push({ nombre: 'Barra Fija', valor: `${test.barraFija} reps` });
  if (test.paralelas) fuerzaResistencia.push({ nombre: 'Paralelas', valor: `${test.paralelas} reps` });

  const resistenciaAerobica = [];
  if (test.navettePalier) resistenciaAerobica.push({ nombre: 'Course Navette', valor: `Palier ${test.navettePalier}` });
  if (test.navetteVO2max) resistenciaAerobica.push({ nombre: 'VO2max', valor: `${test.navetteVO2max} ml/kg/min` });
  if (test.test1500m) resistenciaAerobica.push({ nombre: 'Test 1500m', valor: test.test1500m });

  const tieneValores = fuerzaMaxima.length > 0 || fuerzaResistencia.length > 0 || resistenciaAerobica.length > 0;

  if (!tieneValores) {
    return null; // No mostrar tests sin valores
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {fechaFormateada}
          </CardTitle>
          {test.microciclo && (
            <Badge variant="secondary" className="text-xs">
              Microciclo {test.microciclo.codigoMicrociclo}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Fuerza Maxima (1RM) */}
        {fuerzaMaxima.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Fuerza Maxima (1RM)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fuerzaMaxima.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm">{item.nombre}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">{item.valor}</span>
                    {item.intensidad && (
                      <span className="text-xs text-muted-foreground">{item.intensidad}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fuerza Resistencia */}
        {fuerzaResistencia.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Fuerza Resistencia
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fuerzaResistencia.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm">{item.nombre}</span>
                  <span className="text-sm font-medium">{item.valor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resistencia Aerobica */}
        {resistenciaAerobica.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Resistencia Aerobica
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {resistenciaAerobica.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm">{item.nombre}</span>
                  <span className="text-sm font-medium">{item.valor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {test.observaciones && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{test.observaciones}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
