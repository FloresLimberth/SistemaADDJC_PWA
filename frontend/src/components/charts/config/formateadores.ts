// Funciones puras para formatear ejes y tooltips de graficos
// Patron: toLocaleDateString('es-ES', ...) consistente con el resto del sistema

// Formato corto para ejes X: "15 ene"
export function formatearFechaCorta(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
}

// Formato completo para tooltips: "15 de enero de 2026"
export function formatearFechaTooltip(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Formato decimal con 1 cifra: 6.2
export function formatearDecimal(valor: number): string {
  return valor.toFixed(1);
}

// Formato porcentaje sin decimales: "83%"
export function formatearPorcentaje(valor: number): string {
  return `${Math.round(valor)}%`;
}
