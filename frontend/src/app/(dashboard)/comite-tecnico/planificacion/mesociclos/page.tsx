import { redirect } from 'next/navigation';

// Redirige al calendario principal (la lista vieja fue reemplazada por tabs)
export default function MesociclosPage() {
  redirect('/comite-tecnico/planificacion');
}
