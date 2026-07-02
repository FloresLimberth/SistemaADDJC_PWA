// Exportaciones del modulo de reglas de negocio

// Reglas de rendimiento por ejercicio
export type { Regla, ContextoEvaluacion, AccionRecomendada } from './reglas-rendimiento';

export {
  REGLA_BAJO_RENDIMIENTO_TIPO,
  REGLA_EJERCICIO_RECURRENTE_FALLA,
  REGLA_ZSCORE_CRITICO,
  REGLA_TENDENCIA_NEGATIVA,
  REGLA_MEJORA_DETECTADA,
  TODAS_LAS_REGLAS,
  evaluarReglas,
  obtenerPrioridadMaxima,
} from './reglas-rendimiento';

// Reglas de tests fisicos
export type {
  ReglaTestFisico,
  ContextoTestFisico,
  AccionRecomendadaTestFisico,
  DatosTestFisico,
  ComparacionCampo,
} from './reglas-tests-fisicos';

export {
  CONFIGURACION_TESTS,
  REGLA_CAIDA_CRITICA,
  REGLA_EMPEORAMIENTO,
  REGLA_VO2MAX_MUY_BAJO,
  REGLA_DEFICIT_OBJETIVO,
  REGLA_DESBALANCE_FUERZA,
  REGLA_MEJORA_SIGNIFICATIVA,
  REGLA_OBJETIVO_ALCANZADO,
  TODAS_LAS_REGLAS_TEST_FISICO,
  evaluarReglasTestFisico,
  construirComparaciones,
  obtenerPrioridadMaximaTestFisico,
} from './reglas-tests-fisicos';
