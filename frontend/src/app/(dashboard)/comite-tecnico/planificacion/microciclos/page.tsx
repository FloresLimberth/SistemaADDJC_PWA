import { redirect } from 'next/navigation';

// Redirige al calendario principal (la lista vieja fue reemplazada por tabs)
export default function MicrociclosPage() {
  redirect('/comite-tecnico/planificacion');
}
