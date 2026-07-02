import { fetchTestsHistory } from '@/features/tests-fisicos/actions/fetch-tests-history';
import { TestsHistoryList } from '@/features/tests-fisicos/components/tests-history-list';
import { redirect } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';

// Pagina de tests fisicos del atleta
export default async function TestsPage() {
  // Obtener tests del backend
  const data = await fetchTestsHistory();

  // Si no hay datos, redirigir al login
  if (!data) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tests Fisicos</h1>
        <p className="text-muted-foreground mt-1">
          Historial completo de tus evaluaciones fisicas
        </p>
      </div>

      {/* Lista de tests */}
      <TestsHistoryList tests={data.tests} />
    </div>
  );
}
