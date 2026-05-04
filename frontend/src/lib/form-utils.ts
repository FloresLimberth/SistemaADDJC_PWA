// Sanitiza los valores de FormData convirtiendo null a undefined
// para compatibilidad con schemas Zod que usan .optional()
//
// Problema: FormData.get() devuelve null para campos vacios,
// pero los schemas Zod con .optional() esperan undefined o string
//
// Uso:
// const rawData = sanitizeFormData(formData, ['campo1', 'campo2', ...]);
//
// Aplica a TODOS los server actions que usen FormData + Zod
export function sanitizeFormData(
  formData: FormData,
  fields: string[]
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const field of fields) {
    const value = formData.get(field);

    // Convertir null a undefined para compatibilidad con Zod .optional()
    sanitized[field] = value === null ? undefined : value;
  }

  return sanitized;
}
