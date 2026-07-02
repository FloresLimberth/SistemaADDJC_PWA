// Re-exporta las utilidades de autenticacion compartidas
// Evita duplicar la logica de authFetch en cada feature
// No usa 'use server' porque solo re-exporta funciones de otro modulo server
export { authFetch, getAuthToken } from '@/features/comite-tecnico/actions/base';
