-- Script para insertar datos de prueba realistas para Atleta Prueba (atleta_id = 4)
-- Distribuidos en los últimos 6 meses con evolución progresiva
-- IMPORTANTE: Estos son DATOS DE PRUEBA para desarrollo

-- ==============================================
-- TESTS FISICOS (30 tests distribuidos en 6 meses)
-- ==============================================
-- Evolución realista:
-- - VO2max: 45 → 58 (mejora progresiva)
-- - Palier: 8.0 → 12.5 (mejora progresiva)
-- - Fuerza máxima: mejoras graduales
-- - Fuerza resistencia: mejoras graduales

-- Test 1 (hace 24 semanas - inicio)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "observaciones", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '168 days', 8.0, 45.5, 60.0, 80.0, 90.0, 8, 12, 'Test inicial - temporada 2024', NOW(), NOW());

-- Test 2 (hace 21 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '147 days', 8.5, 46.8, 62.0, 82.0, 92.0, 9, 13, NOW(), NOW());

-- Test 3 (hace 18 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '126 days', 9.0, 48.2, 63.0, 83.0, 94.0, 9, 14, NOW(), NOW());

-- Test 4 (hace 16 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "barraFija", "paralelas", "observaciones", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '112 days', 9.0, 48.0, 10, 15, 'Solo tests de resistencia', NOW(), NOW());

-- Test 5 (hace 15 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '105 days', 9.5, 49.5, 65.0, 85.0, 96.0, 10, 15, NOW(), NOW());

-- Test 6 (hace 13 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "observaciones", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '91 days', 10.0, 50.9, 66.0, 86.0, 98.0, 11, 16, 'Buen progreso general', NOW(), NOW());

-- Test 7 (hace 12 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '84 days', 10.0, 50.5, 11, 17, NOW(), NOW());

-- Test 8 (hace 11 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '77 days', 10.5, 52.3, 68.0, 88.0, 100.0, 12, 18, NOW(), NOW());

-- Test 9 (hace 10 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '70 days', 10.5, 52.0, 12, 18, NOW(), NOW());

-- Test 10 (hace 9 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "observaciones", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '63 days', 11.0, 53.6, 70.0, 90.0, 102.0, 13, 19, 'Mesociclo de fuerza', NOW(), NOW());

-- Test 11 (hace 8 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '56 days', 11.0, 53.3, 13, 20, NOW(), NOW());

-- Test 12 (hace 7 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '49 days', 11.5, 54.9, 72.0, 92.0, 104.0, 14, 21, NOW(), NOW());

-- Test 13 (hace 6 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '42 days', 11.5, 54.6, 14, 21, NOW(), NOW());

-- Test 14 (hace 5 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "observaciones", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '35 days', 12.0, 56.3, 74.0, 94.0, 106.0, 15, 22, 'Pre-competencia', NOW(), NOW());

-- Test 15 (hace 4 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '28 days', 12.0, 56.0, 15, 23, NOW(), NOW());

-- Test 16 (hace 3 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '21 days', 12.5, 57.6, 75.0, 95.0, 108.0, 16, 24, NOW(), NOW());

-- Test 17 (hace 2 semanas)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "barraFija", "paralelas", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '14 days', 12.5, 57.3, 16, 24, NOW(), NOW());

-- Test 18 (hace 1 semana)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "pressBanca", "tiron", "sentadilla", "barraFija", "paralelas", "observaciones", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '7 days', 12.5, 57.9, 76.0, 96.0, 110.0, 17, 25, 'Excelente condicion', NOW(), NOW());

-- Test 19 (hace 3 días - más reciente)
INSERT INTO tests_fisicos ("atletaId", "entrenadorRegistroId", "fechaTest", "navettePalier", "navetteVO2max", "barraFija", "paralelas", "observaciones", "createdAt", "updatedAt")
VALUES (4, 3, CURRENT_DATE - INTERVAL '3 days', 12.5, 58.2, 17, 26, 'Nuevo record personal VO2max', NOW(), NOW());

-- ==============================================
-- REGISTROS POST-ENTRENAMIENTO (100 registros en 3 meses)
-- ==============================================
-- Distribuidos con variaciones realistas de:
-- - RPE: 4-9 (esfuerzo percibido)
-- - Calidad sueño: 5-9
-- - Horas sueño: 6.0-9.0
-- - Estado anímico: 5-9

-- Últimos 90 días (12-13 semanas, ~100 entrenamientos)
-- Promedio: 7-8 entrenamientos por semana

DO $$
DECLARE
  dias_atras INT;
  rpe_val INT;
  calidad_sueno_val INT;
  horas_sueno_val DECIMAL(3,1);
  estado_animico_val INT;
  ejercicios_completados_val DECIMAL(5,2);
  intensidad_alcanzada_val DECIMAL(5,2);
  duracion_real_val INT;
  contador INT := 0;
  sesion_ids INT[] := ARRAY[15,16,17,18,19,20,34,35,36,37,38,39,40];
  sesion_id_selected INT;
BEGIN
  FOR dias_atras IN REVERSE 90..1 LOOP
    -- Saltear algunos días (domingos y días de descanso)
    IF EXTRACT(DOW FROM (CURRENT_DATE - (dias_atras || ' days')::INTERVAL)) = 0 THEN
      CONTINUE; -- Saltar domingos
    END IF;

    -- Descanso adicional cada 7 días aproximadamente
    IF dias_atras % 7 = 0 AND random() < 0.3 THEN
      CONTINUE;
    END IF;

    contador := contador + 1;

    -- Generar valores realistas con variación
    -- RPE más alto en días de entrenamiento intenso
    IF contador % 8 = 0 OR contador % 9 = 0 THEN
      rpe_val := 8 + FLOOR(random() * 2)::INT; -- 8-9 (días intensos)
      intensidad_alcanzada_val := 85.0 + (random() * 15)::DECIMAL(5,2); -- 85-100%
      duracion_real_val := 100 + FLOOR(random() * 50)::INT; -- 100-150 min
    ELSIF contador % 4 = 0 THEN
      rpe_val := 6 + FLOOR(random() * 2)::INT; -- 6-7 (días moderados)
      intensidad_alcanzada_val := 70.0 + (random() * 15)::DECIMAL(5,2); -- 70-85%
      duracion_real_val := 80 + FLOOR(random() * 30)::INT; -- 80-110 min
    ELSE
      rpe_val := 4 + FLOOR(random() * 3)::INT; -- 4-6 (días ligeros)
      intensidad_alcanzada_val := 60.0 + (random() * 15)::DECIMAL(5,2); -- 60-75%
      duracion_real_val := 60 + FLOOR(random() * 30)::INT; -- 60-90 min
    END IF;

    -- Ejercicios completados generalmente alto
    ejercicios_completados_val := 80.0 + (random() * 20)::DECIMAL(5,2); -- 80-100%

    -- Calidad de sueño afectada por RPE alto
    IF rpe_val >= 8 THEN
      calidad_sueno_val := 5 + FLOOR(random() * 3)::INT; -- 5-7 (peor después de días intensos)
      horas_sueno_val := 6.0 + (random() * 2.0)::DECIMAL(3,1); -- 6.0-8.0h
    ELSE
      calidad_sueno_val := 7 + FLOOR(random() * 3)::INT; -- 7-9 (mejor en días ligeros)
      horas_sueno_val := 7.0 + (random() * 2.0)::DECIMAL(3,1); -- 7.0-9.0h
    END IF;

    -- Estado anímico correlacionado con sueño
    IF calidad_sueno_val >= 8 THEN
      estado_animico_val := 8 + FLOOR(random() * 2)::INT; -- 8-9
    ELSIF calidad_sueno_val >= 6 THEN
      estado_animico_val := 6 + FLOOR(random() * 3)::INT; -- 6-8
    ELSE
      estado_animico_val := 5 + FLOOR(random() * 2)::INT; -- 5-6
    END IF;

    -- Seleccionar sesión aleatoria del array
    sesion_id_selected := sesion_ids[1 + FLOOR(random() * array_length(sesion_ids, 1))::INT];

    -- Insertar registro
    INSERT INTO registros_post_entrenamiento (
      "atletaId",
      "sesionId",
      "entrenadorRegistroId",
      "fechaRegistro",
      "asistio",
      "ejerciciosCompletados",
      "intensidadAlcanzada",
      "duracionReal",
      "rpe",
      "calidadSueno",
      "horasSueno",
      "estadoAnimico",
      "createdAt",
      "updatedAt"
    ) VALUES (
      4,                                                    -- atletaId
      sesion_id_selected,                                   -- sesionId (selección aleatoria)
      3,                                                    -- entrenadorRegistroId
      CURRENT_DATE - (dias_atras || ' days')::INTERVAL,   -- fechaRegistro
      true,                                                 -- asistio
      ejercicios_completados_val,
      intensidad_alcanzada_val,
      duracion_real_val,
      rpe_val,
      calidad_sueno_val,
      horas_sueno_val,
      estado_animico_val,
      NOW(),
      NOW()
    );

    -- Limitar a ~100 registros
    EXIT WHEN contador >= 100;
  END LOOP;
END $$;

-- Mostrar resumen de datos insertados
SELECT 'Tests Fisicos insertados:' as tipo, COUNT(*) as cantidad FROM tests_fisicos WHERE "atletaId" = 4
UNION ALL
SELECT 'Registros Post-Entrenamiento insertados:', COUNT(*) FROM registros_post_entrenamiento WHERE "atletaId" = 4;
