// Re-exports de Server Actions para COMITE_TECNICO

// Base helpers
export { getAuthToken, authFetch } from './base';

// Dashboard
export { fetchDashboardStats } from './fetch-dashboard-stats';

// Atletas
export { fetchAtletas, fetchAtleta } from './fetch-atletas';
export type { FetchAtletasParams } from './fetch-atletas';

// Entrenadores
export { fetchEntrenadores, fetchEntrenador } from './fetch-entrenadores';
export type { FetchEntrenadoresParams } from './fetch-entrenadores';

// Planificacion (Macrociclos, Mesociclos, Microciclos, Asignaciones, Sesiones)
export {
  fetchMacrociclos,
  fetchMacrociclo,
  fetchMesociclos,
  fetchMesociclo,
  fetchMicrociclos,
  fetchMicrociclo,
  fetchAsignaciones,
  fetchAsignacion,
  fetchSesiones,
  fetchSesion,
  fetchMicrociclosParaSelector,
} from './fetch-planificacion';
export type {
  FetchMacrociclosParams,
  FetchMesociclosParams,
  FetchMicrociclosParams,
  FetchAsignacionesParams,
  FetchSesionesParams,
  SesionCompleta,
  MicrocicloParaSelector,
} from './fetch-planificacion';

// Tests Fisicos y Dolencias
export {
  fetchTestsFisicos,
  fetchTestFisico,
  fetchTestsByAtleta,
  fetchDolencias,
  fetchDolencia,
  fetchDolenciasActivasByAtleta,
} from './fetch-tests-dolencias';
export type {
  FetchTestsFisicosParams,
  FetchDolenciasParams,
} from './fetch-tests-dolencias';

// Acciones de escritura - Macrociclos
export {
  createMacrociclo,
  updateMacrociclo,
  deleteMacrociclo,
  fetchMacrocicloDeleteInfo,
} from './macrociclo.actions';
export type { MacrocicloDeleteInfo } from './macrociclo.actions';

// Acciones de escritura - Mesociclos
export {
  createMesociclo,
  updateMesociclo,
  deleteMesociclo,
  fetchMesocicloDeleteInfo,
} from './mesociclo.actions';
export type { MesocicloDeleteInfo } from './mesociclo.actions';

// Acciones de escritura - Microciclos
export {
  createMicrociclo,
  updateMicrociclo,
  deleteMicrociclo,
  fetchMicrocicloDeleteInfo,
} from './microciclo.actions';
export type { MicrocicloDeleteInfo } from './microciclo.actions';

// Acciones de escritura - Asignaciones
export {
  createAsignacion,
  deleteAsignacion,
  updateAsignacion,
} from './asignacion.actions';

// Acciones de escritura - Sesiones
export { createSesion, updateSesion, deleteSesion } from './sesion.actions';

// Acciones de ejercicios de sesion
export { updateEjerciciosSesion } from './ejercicios-sesion.actions';
export type { EjercicioParaAsignar } from './ejercicios-sesion.actions';

// Acciones de escritura - Atletas
export { createAtleta, updateAtleta, deleteAtleta } from './atleta.actions';

// Acciones de escritura - Entrenadores
export {
  createEntrenador,
  updateEntrenador,
  deleteEntrenador,
} from './entrenador.actions';

// Estadisticas de atletas
export {
  fetchAtletaEstadisticas,
  fetchAtletaEvolucion,
  fetchAtletaEstadisticasCompletas,
} from './fetch-estadisticas';
export type {
  AtletaEstadisticas,
  AtletaEvolucion,
  TipoTest,
} from './fetch-estadisticas';
export { TIPOS_TEST } from './estadisticas.types';

// Atletas para selector (dropdown)
export { fetchAtletasParaSelector } from './fetch-atletas-selector';

// Registros Post-Entrenamiento
export {
  fetchRegistrosPostEntrenamiento,
  fetchRegistroPostEntrenamiento,
} from './fetch-registros';
export type {
  RegistroPostEntrenamiento,
  FetchRegistrosParams,
  FetchRegistrosResult,
} from './fetch-registros';
