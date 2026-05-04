-- ============================================================
-- CHECK CONSTRAINTS FOR DATA VALIDATION
-- ============================================================
-- This migration adds CHECK constraints to enforce business rules
-- and data integrity at the database level.
-- ============================================================

-- ============================================================
-- REGISTROS POST-ENTRENAMIENTO - Validaciones de rangos
-- ============================================================

-- RPE (Rate of Perceived Exertion) debe estar entre 1 y 10
ALTER TABLE "registros_post_entrenamiento"
ADD CONSTRAINT "check_rpe_range"
CHECK ("rpe" >= 1 AND "rpe" <= 10);

-- Calidad de sueño debe estar entre 1 y 10
ALTER TABLE "registros_post_entrenamiento"
ADD CONSTRAINT "check_calidad_sueno_range"
CHECK ("calidadSueno" >= 1 AND "calidadSueno" <= 10);

-- Estado anímico debe estar entre 1 y 10
ALTER TABLE "registros_post_entrenamiento"
ADD CONSTRAINT "check_estado_animico_range"
CHECK ("estadoAnimico" >= 1 AND "estadoAnimico" <= 10);

-- Ejercicios completados debe ser un porcentaje (0-100)
ALTER TABLE "registros_post_entrenamiento"
ADD CONSTRAINT "check_ejercicios_completados_range"
CHECK ("ejerciciosCompletados" >= 0 AND "ejerciciosCompletados" <= 100);

-- Intensidad alcanzada debe ser un porcentaje (0-100)
ALTER TABLE "registros_post_entrenamiento"
ADD CONSTRAINT "check_intensidad_alcanzada_range"
CHECK ("intensidadAlcanzada" >= 0 AND "intensidadAlcanzada" <= 100);

-- Horas de sueño debe estar entre 0 y 24
ALTER TABLE "registros_post_entrenamiento"
ADD CONSTRAINT "check_horas_sueno_range"
CHECK ("horasSueno" IS NULL OR ("horasSueno" >= 0 AND "horasSueno" <= 24));

-- Duración real debe ser positiva
ALTER TABLE "registros_post_entrenamiento"
ADD CONSTRAINT "check_duracion_real_positive"
CHECK ("duracionReal" > 0);

-- ============================================================
-- TESTS FÍSICOS - Validaciones de intensidad
-- ============================================================

-- Intensidades deben ser porcentajes (0-100)
ALTER TABLE "tests_fisicos"
ADD CONSTRAINT "check_press_banca_intensidad_range"
CHECK ("pressBancaIntensidad" IS NULL OR ("pressBancaIntensidad" >= 0 AND "pressBancaIntensidad" <= 100));

ALTER TABLE "tests_fisicos"
ADD CONSTRAINT "check_tiron_intensidad_range"
CHECK ("tironIntensidad" IS NULL OR ("tironIntensidad" >= 0 AND "tironIntensidad" <= 100));

ALTER TABLE "tests_fisicos"
ADD CONSTRAINT "check_sentadilla_intensidad_range"
CHECK ("sentadillaIntensidad" IS NULL OR ("sentadillaIntensidad" >= 0 AND "sentadillaIntensidad" <= 100));

-- Tests de fuerza resistencia deben ser positivos
ALTER TABLE "tests_fisicos"
ADD CONSTRAINT "check_barra_fija_positive"
CHECK ("barraFija" IS NULL OR "barraFija" >= 0);

ALTER TABLE "tests_fisicos"
ADD CONSTRAINT "check_paralelas_positive"
CHECK ("paralelas" IS NULL OR "paralelas" >= 0);

-- ============================================================
-- TOLERANCIAS PESO - Validaciones de porcentajes
-- ============================================================

-- Tolerancias deben ser porcentajes positivos (0-100)
ALTER TABLE "tolerancias_peso"
ADD CONSTRAINT "check_tolerancia_lunes_range"
CHECK ("toleranciaLunes" >= 0 AND "toleranciaLunes" <= 100);

ALTER TABLE "tolerancias_peso"
ADD CONSTRAINT "check_tolerancia_viernes_range"
CHECK ("toleranciaViernes" >= 0 AND "toleranciaViernes" <= 100);

-- ============================================================
-- SESIONES - Validaciones de planificación
-- ============================================================

-- Duración planificada debe ser positiva (en minutos)
ALTER TABLE "sesiones"
ADD CONSTRAINT "check_duracion_planificada_positive"
CHECK ("duracionPlanificada" > 0);

-- Volumen planificado debe ser positivo
ALTER TABLE "sesiones"
ADD CONSTRAINT "check_volumen_planificado_positive"
CHECK ("volumenPlanificado" > 0);

-- Intensidad planificada debe ser porcentaje (0-100)
ALTER TABLE "sesiones"
ADD CONSTRAINT "check_intensidad_planificada_range"
CHECK ("intensidadPlanificada" >= 0 AND "intensidadPlanificada" <= 100);

-- Frecuencia cardíaca objetivo debe estar en rango razonable (40-220 bpm)
ALTER TABLE "sesiones"
ADD CONSTRAINT "check_fc_objetivo_range"
CHECK ("fcObjetivo" IS NULL OR ("fcObjetivo" >= 40 AND "fcObjetivo" <= 220));

-- Duración real debe ser positiva si existe
ALTER TABLE "sesiones"
ADD CONSTRAINT "check_duracion_real_positive"
CHECK ("duracionReal" IS NULL OR "duracionReal" > 0);

-- Volumen real debe ser positivo si existe
ALTER TABLE "sesiones"
ADD CONSTRAINT "check_volumen_real_positive"
CHECK ("volumenReal" IS NULL OR "volumenReal" > 0);

-- Intensidad real debe ser porcentaje si existe
ALTER TABLE "sesiones"
ADD CONSTRAINT "check_intensidad_real_range"
CHECK ("intensidadReal" IS NULL OR ("intensidadReal" >= 0 AND "intensidadReal" <= 100));

-- ============================================================
-- ATLETAS - Validaciones básicas
-- ============================================================

-- Frecuencia cardíaca en reposo debe estar en rango razonable (30-100 bpm)
ALTER TABLE "atletas"
ADD CONSTRAINT "check_fc_reposo_range"
CHECK ("fcReposo" IS NULL OR ("fcReposo" >= 30 AND "fcReposo" <= 100));

-- Peso actual debe ser positivo
ALTER TABLE "atletas"
ADD CONSTRAINT "check_peso_actual_positive"
CHECK ("pesoActual" IS NULL OR "pesoActual" > 0);

-- Edad debe ser positiva y razonable (5-100 años)
ALTER TABLE "atletas"
ADD CONSTRAINT "check_edad_range"
CHECK ("edad" >= 5 AND "edad" <= 100);

-- ============================================================
-- MACROCICLOS - Validaciones de fechas y totales
-- ============================================================

-- Fecha fin debe ser posterior a fecha inicio
ALTER TABLE "macrociclos"
ADD CONSTRAINT "check_fechas_macrociclo"
CHECK ("fechaFin" > "fechaInicio");

-- Total de microciclos debe ser positivo
ALTER TABLE "macrociclos"
ADD CONSTRAINT "check_total_microciclos_positive"
CHECK ("totalMicrociclos" > 0);

-- Total de sesiones debe ser positivo
ALTER TABLE "macrociclos"
ADD CONSTRAINT "check_total_sesiones_positive"
CHECK ("totalSesiones" > 0);

-- Total de horas debe ser positivo
ALTER TABLE "macrociclos"
ADD CONSTRAINT "check_total_horas_positive"
CHECK ("totalHoras" > 0);

-- ============================================================
-- MESOCICLOS - Validaciones de fechas
-- ============================================================

-- Fecha fin debe ser posterior a fecha inicio
ALTER TABLE "mesociclos"
ADD CONSTRAINT "check_fechas_mesociclo"
CHECK ("fechaFin" > "fechaInicio");

-- ============================================================
-- MICROCICLOS - Validaciones de fechas
-- ============================================================

-- Fecha fin debe ser posterior a fecha inicio
ALTER TABLE "microciclos"
ADD CONSTRAINT "check_fechas_microciclo"
CHECK ("fechaFin" > "fechaInicio");
