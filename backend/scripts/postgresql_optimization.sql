-- ============================================================
-- POSTGRESQL 17 OPTIMIZATION CONFIGURATION
-- ============================================================
-- Script de configuración para optimizar PostgreSQL 17
-- para la base de datos db_addjc
--
-- IMPORTANTE: Estos valores están calibrados para:
-- - Sistema de desarrollo/producción típico
-- - RAM disponible: 4-8 GB
-- - Carga de trabajo mixta (OLTP)
-- ============================================================

-- ============================================================
-- CONEXIÓN Y AUTENTICACIÓN
-- ============================================================

-- Configurar el timezone a la zona horaria de Bolivia
ALTER DATABASE db_addjc SET timezone TO 'America/La_Paz';

-- ============================================================
-- MEMORIA - Configuraciones para mejor rendimiento
-- ============================================================

-- shared_buffers: Memoria compartida para caché (25% de RAM)
-- Para 8GB RAM = 2GB, para 4GB RAM = 1GB
-- NOTA: Esta configuración requiere reiniciar PostgreSQL
-- Descomentar y ajustar en postgresql.conf:
-- shared_buffers = 2GB

-- effective_cache_size: Estimación de memoria disponible para caché (50-75% de RAM)
-- Para 8GB RAM = 6GB, para 4GB RAM = 3GB
-- NOTA: Esta configuración requiere reiniciar PostgreSQL
-- Descomentar y ajustar en postgresql.conf:
-- effective_cache_size = 6GB

-- work_mem: Memoria para operaciones de ordenamiento y hash (por operación)
-- Aumentar para mejorar performance de queries complejos
ALTER DATABASE db_addjc SET work_mem TO '16MB';

-- maintenance_work_mem: Memoria para operaciones de mantenimiento (VACUUM, CREATE INDEX)
ALTER DATABASE db_addjc SET maintenance_work_mem TO '256MB';

-- ============================================================
-- WRITE-AHEAD LOG (WAL) - Configuraciones para durabilidad
-- ============================================================

-- wal_buffers: Búferes para WAL (automático es generalmente óptimo)
-- NOTA: Esta configuración requiere reiniciar PostgreSQL
-- Descomentar en postgresql.conf:
-- wal_buffers = 16MB

-- checkpoint_completion_target: Distribuir checkpoints en el tiempo (0-1)
-- 0.9 = distribuir sobre el 90% del intervalo entre checkpoints
-- NOTA: Esta configuración requiere reiniciar PostgreSQL
-- Descomentar en postgresql.conf:
-- checkpoint_completion_target = 0.9

-- ============================================================
-- QUERY PLANNER - Configuraciones para optimización de queries
-- ============================================================

-- random_page_cost: Costo de acceso aleatorio a disco
-- Reducir para SSDs (default 4.0, para SSD usar 1.1)
ALTER DATABASE db_addjc SET random_page_cost TO 1.1;

-- effective_io_concurrency: Número de operaciones I/O concurrentes (para SSDs)
ALTER DATABASE db_addjc SET effective_io_concurrency TO 200;

-- default_statistics_target: Nivel de detalle para estadísticas
-- Aumentar mejora la calidad del plan de ejecución
ALTER DATABASE db_addjc SET default_statistics_target TO 100;

-- ============================================================
-- PARALELISMO - Configuraciones para queries paralelos
-- ============================================================

-- max_parallel_workers_per_gather: Trabajadores paralelos por nodo Gather
ALTER DATABASE db_addjc SET max_parallel_workers_per_gather TO 2;

-- max_parallel_workers: Máximo de trabajadores paralelos en total
-- NOTA: Esta configuración requiere reiniciar PostgreSQL
-- Descomentar en postgresql.conf:
-- max_parallel_workers = 4

-- ============================================================
-- AUTOVACUUM - Configuraciones para limpieza automática
-- ============================================================

-- Habilitar autovacuum (debe estar habilitado)
ALTER DATABASE db_addjc SET autovacuum TO on;

-- autovacuum_max_workers: Número de procesos autovacuum
-- NOTA: Esta configuración requiere reiniciar PostgreSQL
-- Descomentar en postgresql.conf:
-- autovacuum_max_workers = 3

-- Umbrales más agresivos para tablas con alta actividad
ALTER DATABASE db_addjc SET autovacuum_vacuum_scale_factor TO 0.1;
ALTER DATABASE db_addjc SET autovacuum_analyze_scale_factor TO 0.05;

-- ============================================================
-- LOGGING - Configuraciones para monitoreo
-- ============================================================

-- log_min_duration_statement: Registrar queries lentos (en ms)
-- 1000ms = registrar queries que tarden más de 1 segundo
ALTER DATABASE db_addjc SET log_min_duration_statement TO 1000;

-- log_line_prefix: Formato del log para mejor debugging
-- NOTA: Esta configuración requiere reiniciar PostgreSQL
-- Descomentar en postgresql.conf:
-- log_line_prefix = '%t [%p]: user=%u,db=%d,app=%a,client=%h '

-- ============================================================
-- ESTADÍSTICAS - Habilitar tracking de queries
-- ============================================================

-- Habilitar pg_stat_statements para análisis de rendimiento
-- NOTA: Requiere reiniciar PostgreSQL y tener la extensión instalada
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================================
-- ÍNDICES - Configuraciones para optimización
-- ============================================================

-- Analizar todas las tablas para actualizar estadísticas después de crear índices
ANALYZE VERBOSE;

-- ============================================================
-- VACUUMING - Limpieza inicial
-- ============================================================

-- Ejecutar VACUUM ANALYZE en todas las tablas para optimizar
VACUUM ANALYZE;

-- ============================================================
-- INFORMACIÓN
-- ============================================================

SELECT 'Configuración de PostgreSQL aplicada exitosamente!' as mensaje;
SELECT 'IMPORTANTE: Algunas configuraciones requieren editar postgresql.conf y reiniciar PostgreSQL.' as nota;
SELECT 'Ubicación típica de postgresql.conf en Windows: C:\\Program Files\\PostgreSQL\\17\\data\\postgresql.conf' as ubicacion;

-- Mostrar configuraciones actuales de la base de datos
SELECT name, setting, unit, context
FROM pg_settings
WHERE name IN (
  'shared_buffers',
  'effective_cache_size',
  'work_mem',
  'maintenance_work_mem',
  'random_page_cost',
  'effective_io_concurrency',
  'default_statistics_target',
  'max_parallel_workers_per_gather',
  'autovacuum',
  'log_min_duration_statement'
)
ORDER BY name;
