// Tipo para resultados de Server Actions
// Patron "errores como datos": nunca lanzar excepciones, siempre retornar resultado tipado

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]>; submittedData?: Record<string, unknown> };

// Estado inicial para useActionState (cuando success es false y no hay error aun)
export const initialActionState: ActionResult = {
  success: false,
  error: '',
};
