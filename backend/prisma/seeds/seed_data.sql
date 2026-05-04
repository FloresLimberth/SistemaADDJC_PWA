-- ============================================================================
-- SEED DATA para Sistema ADDJC
-- Datos estáticos de sistema (NO son datos de prueba)
-- Fuente: docs/excel/nomenclatura.txt, docs/excel/planBD.txt
-- Total: 69 registros (12 baremos + 24 nomenclatura + 33 zonas_esfuerzo)
-- ============================================================================

-- ============================================================================
-- TABLA: baremos (12 registros)
-- Fuente: docs/excel/nomenclatura.txt líneas 31-37
-- Descripción: Estándares de referencia para validar niveles de carga
-- ============================================================================

INSERT INTO baremos (tipo, nivel, "porcentajeMin", "porcentajeMax", "minutosMin", "minutosMax", "fcMin", "fcMax", "createdAt", "updatedAt") VALUES
-- VOLUMEN - 6 niveles (medido en % y minutos/semana)
('VOLUMEN', 1, 0.00, 25.00, 90, 108, NULL, NULL, NOW(), NOW()),
('VOLUMEN', 2, 26.00, 40.00, 109, 126, NULL, NULL, NOW(), NOW()),
('VOLUMEN', 3, 41.00, 55.00, 127, 144, NULL, NULL, NOW(), NOW()),
('VOLUMEN', 4, 56.00, 70.00, 145, 163, NULL, NULL, NOW(), NOW()),
('VOLUMEN', 5, 71.00, 85.00, 164, 180, NULL, NULL, NOW(), NOW()),
('VOLUMEN', 6, 86.00, 100.00, 180, 208, NULL, NULL, NOW(), NOW()),

-- INTENSIDAD - 6 niveles (medido en % y frecuencia cardíaca)
('INTENSIDAD', 1, 100.00, 100.00, NULL, NULL, 209, 220, NOW(), NOW()),
('INTENSIDAD', 2, 85.00, 85.00, NULL, NULL, 190, 209, NOW(), NOW()),
('INTENSIDAD', 3, 70.00, 70.00, NULL, NULL, 170, 189, NOW(), NOW()),
('INTENSIDAD', 4, 55.00, 55.00, NULL, NULL, 150, 169, NOW(), NOW()),
('INTENSIDAD', 5, 40.00, 40.00, NULL, NULL, 130, 149, NOW(), NOW()),
('INTENSIDAD', 6, 25.00, 25.00, NULL, NULL, 110, 129, NOW(), NOW())
ON CONFLICT (tipo, nivel) DO NOTHING;

-- ============================================================================
-- TABLA: nomenclatura (24 registros)
-- Fuente: docs/excel/nomenclatura.txt líneas 0-22
-- Descripción: Diccionario de códigos abreviados del Excel
-- ============================================================================

INSERT INTO nomenclatura (codigo, "nombreCompleto", categoria, descripcion, "wintPercent", "sistemaEnergetico", "createdAt", "updatedAt") VALUES
-- CUALIDADES FÍSICAS (líneas 13-22)
('F', 'Fuerza', 'CUALIDAD_FISICA', 'Fuerza básica - Desarrollo de fuerza máxima', 70.00, 'Anaeróbico alactácido', NOW(), NOW()),
('FRes', 'Fuerza resistencia', 'CUALIDAD_FISICA', 'Resistencia a la fuerza - Capacidad de mantener esfuerzos de fuerza prolongados', 80.00, 'Anaeróbico lactácido', NOW(), NOW()),
('F especial', 'Fuerza especial', 'CUALIDAD_FISICA', 'Fuerza específica del judo - Alta intensidad con técnicas específicas', 85.00, 'Anaeróbico lactácido', NOW(), NOW()),
('Res', 'Resistencia', 'CUALIDAD_FISICA', 'Resistencia básica - Capacidad aeróbica general', 75.00, 'Aeróbico', NOW(), NOW()),
('ResF', 'Resistencia a la fuerza', 'CUALIDAD_FISICA', 'Resistencia combinada con fuerza - Trabajo de fuerza prolongado', 80.00, 'Anaeróbico lactácido', NOW(), NOW()),
('Res Vel', 'Resistencia a la velocidad', 'CUALIDAD_FISICA', 'Capacidad de mantener velocidad en esfuerzos prolongados', 95.00, 'Anaeróbico lactácido', NOW(), NOW()),
('Vel', 'Velocidad', 'CUALIDAD_FISICA', 'Velocidad máxima - Esfuerzos explosivos de corta duración', 100.00, 'Anaeróbico alactácido', NOW(), NOW()),
('Vel reac', 'Velocidad de reacción', 'CUALIDAD_FISICA', 'Velocidad de respuesta a estímulos - Tiempo de reacción', 100.00, 'Anaeróbico alactácido', NOW(), NOW()),
('Vel especial', 'Velocidad especial', 'CUALIDAD_FISICA', 'Velocidad específica del judo - Ataques explosivos', 95.00, 'Anaeróbico alactácido', NOW(), NOW()),
('Fl', 'Flexibilidad', 'CUALIDAD_FISICA', 'Amplitud de movimiento - Elasticidad muscular y articular', NULL, NULL, NOW(), NOW()),

-- CONTENIDOS (líneas 0-2, 12-14)
('Calento. X''', 'Calentamiento', 'CONTENIDO', 'Ejercicios físicos globales, específicos y físico-técnicos (I máx = umbral anaeróbico) - Movilización general (calistenia)', NULL, NULL, NOW(), NOW()),
('CROSS X''', 'Carrera continua', 'CONTENIDO', 'Carrera continua en el umbral anaeróbico como media (I máx = umbral anaeróbico)', 75.00, 'Aeróbico', NOW(), NOW()),
('TATAMI X''', 'Trabajos técnicos en tatami', 'CONTENIDO', 'Trabajos de aprendizaje y perfeccionamiento técnico (I máx = umbral anaeróbico)', NULL, NULL, NOW(), NOW()),
('VelGral', 'Velocidad general', 'CONTENIDO', '50 mts lisos - Velocidad máxima en carrera', 100.00, 'Anaeróbico alactácido', NOW(), NOW()),
('ResVelGral', 'Res. a velocidad general', 'CONTENIDO', '200 mts lisos - Resistencia a la velocidad', 95.00, 'Anaeróbico lactácido', NOW(), NOW()),
('Res Gral', 'Resistencia general', 'CONTENIDO', '1500 mts lisos - Resistencia aeróbica general', 75.00, 'Aeróbico-anaeróbico lactácido', NOW(), NOW()),
('ResFGral', 'Resistencia a la fuerza general', 'CONTENIDO', 'Ejercicios de fuerza resistencia - Barra, paralelas, etc.', 80.00, 'Anaeróbico lactácido', NOW(), NOW()),

-- ZONAS DE ESFUERZO COMBINADAS (líneas 3-10)
('Vel-F-Fl', 'Velocidad-Fuerza-Flexibilidad', 'ZONA_ESFUERZO', 'Res básica 1 - Combinación de velocidad, fuerza y flexibilidad', 75.00, NULL, NOW(), NOW()),
('Res-ResF', 'Resistencia-Resistencia a la fuerza', 'ZONA_ESFUERZO', 'Res básica 2 - Combinación de resistencia aeróbica y fuerza resistencia', 75.00, NULL, NOW(), NOW()),
('ResVel-F', 'Resistencia velocidad-Fuerza', 'ZONA_ESFUERZO', 'VO2 máx 1 - Combinación de resistencia a la velocidad y fuerza', 80.00, NULL, NOW(), NOW()),
('Vel reac-F', 'Velocidad reacción-Fuerza', 'ZONA_ESFUERZO', 'Tol lact 1 - Velocidad de reacción con componente de fuerza', 85.00, NULL, NOW(), NOW()),
('ResVel-FRes', 'Resistencia velocidad-Fuerza resistencia', 'ZONA_ESFUERZO', 'VO2 máx 2 - Resistencia a velocidad alta con fuerza resistencia', 80.00, NULL, NOW(), NOW()),
('F-Vel especial', 'Fuerza-Velocidad especial', 'ZONA_ESFUERZO', 'Pot anae máx - Potencia anaeróbica máxima, fuerza explosiva', 95.00, NULL, NOW(), NOW()),
('ResVel', 'Resistencia velocidad', 'ZONA_ESFUERZO', 'Res especial - Resistencia específica a la velocidad', 95.00, NULL, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- TABLA: zonas_esfuerzo (33 registros)
-- Fuente: docs/excel/planBD.txt (columnas Zona esfuerzo_lu, _ma, _mi, _ju, _vi, _sa)
-- Descripción: Zonas metabólicas de entrenamiento para planificación de sesiones
-- ============================================================================

INSERT INTO zonas_esfuerzo (codigo, "nombreCompleto", categoria, "wintPercent", descripcion, "createdAt", "updatedAt") VALUES
-- FUERZA
('Fmáx', 'Fuerza máxima', 'FUERZA', 70.00, 'Desarrollo de fuerza máxima - Cargas >85% 1RM, series de 1-5 reps, pausas 3-5 min', NOW(), NOW()),
('F básica', 'Fuerza básica', 'FUERZA', 70.00, 'Fuerza básica general - Cargas 70-85% 1RM', NOW(), NOW()),
('F especial', 'Fuerza especial', 'FUERZA', 85.00, 'Fuerza específica del judo - Ejercicios técnicos con alta carga', NOW(), NOW()),
('(F-ResF)máx', 'Fuerza-Resistencia a la fuerza máxima', 'FUERZA', 75.00, 'Combinación de fuerza máxima y resistencia a la fuerza', NOW(), NOW()),

-- RESISTENCIA
('Res básica 0', 'Resistencia básica nivel 0', 'RESISTENCIA', 60.00, 'Resistencia aeróbica muy básica - Recuperación activa', NOW(), NOW()),
('Res básica 1', 'Resistencia básica nivel 1', 'RESISTENCIA', 75.00, 'Resistencia aeróbica básica - Trabajo continuo moderado', NOW(), NOW()),
('Res básica 2', 'Resistencia básica nivel 2', 'RESISTENCIA', 75.00, 'Resistencia aeróbica avanzada - Umbral anaeróbico', NOW(), NOW()),
('Res especial', 'Resistencia especial', 'RESISTENCIA', 85.00, 'Resistencia específica del judo - Alta intensidad específica', NOW(), NOW()),
('Res Esp 1', 'Resistencia especial tipo 1', 'RESISTENCIA', 85.00, 'Resistencia especial tipo 1 - Trabajo interválico específico', NOW(), NOW()),
('Res Esp 5''', 'Resistencia especial 5 minutos', 'RESISTENCIA', 85.00, 'Resistencia especial con esfuerzos de 5 minutos', NOW(), NOW()),
('(ResF-Paero)máx', 'Resistencia fuerza-Potencia aeróbica máxima', 'RESISTENCIA', 85.00, 'Combinación de resistencia a la fuerza y potencia aeróbica', NOW(), NOW()),
('(ResF-Vel)máx', 'Resistencia fuerza-Velocidad máxima', 'RESISTENCIA', 90.00, 'Combinación de resistencia a la fuerza y velocidad máxima', NOW(), NOW()),
('Res-F-Fl', 'Resistencia-Fuerza-Flexibilidad', 'RESISTENCIA', 75.00, 'Trabajo combinado de resistencia, fuerza y flexibilidad', NOW(), NOW()),

-- VO2MAX
('VO2 máx 0', 'VO2 máximo nivel 0', 'VO2MAX', 70.00, 'Trabajo de VO2max nivel básico', NOW(), NOW()),
('VO2 máx 1', 'VO2 máximo nivel 1', 'VO2MAX', 80.00, 'Trabajo de VO2max al 80% - Mejora capacidad aeróbica máxima', NOW(), NOW()),
('VO2máx 1', 'VO2máx nivel 1', 'VO2MAX', 80.00, 'VO2máx nivel 1 (sin espacio) - Equivalente a VO2 máx 1', NOW(), NOW()),
('VO2 máx 2', 'VO2 máximo nivel 2', 'VO2MAX', 80.00, 'Trabajo de VO2max nivel 2 - Intervalos de alta intensidad', NOW(), NOW()),
('VO2máx 2', 'VO2máx nivel 2', 'VO2MAX', 80.00, 'VO2máx nivel 2 (sin espacio) - Equivalente a VO2 máx 2', NOW(), NOW()),

-- TOLERANCIA LACTATO
('Tol lact 1', 'Tolerancia lactato tipo 1', 'TOLERANCIA_LACTATO', 85.00, 'Tolerancia al lactato nivel 1 - Trabajo por encima del umbral anaeróbico', NOW(), NOW()),
('Tol lact 2', 'Tolerancia lactato tipo 2', 'TOLERANCIA_LACTATO', 85.00, 'Tolerancia al lactato nivel 2 - Alta acumulación de lactato', NOW(), NOW()),

-- POTENCIA
('Pot anae máx', 'Potencia anaeróbica máxima', 'POTENCIA', 95.00, 'Potencia anaeróbica máxima - Esfuerzos explosivos de 10-30 segundos', NOW(), NOW()),

-- VELOCIDAD
('Vel Esp 1', 'Velocidad especial tipo 1', 'VELOCIDAD', 100.00, 'Velocidad especial del judo - Ataques explosivos máximos', NOW(), NOW()),
('Res Vel Esp 1''', 'Resistencia velocidad especial 1 minuto', 'VELOCIDAD', 95.00, 'Resistencia a la velocidad específica con esfuerzos de 1 minuto', NOW(), NOW()),
('ResVel máx', 'Resistencia a la velocidad máxima', 'VELOCIDAD', 95.00, 'Resistencia a la velocidad al máximo - Repeticiones de alta velocidad', NOW(), NOW()),
('ResVel-FRes', 'Resistencia velocidad-Fuerza resistencia', 'VELOCIDAD', 85.00, 'Combinación de resistencia a la velocidad y fuerza resistencia', NOW(), NOW()),

-- RECUPERACION
('Descanso', 'Descanso completo', 'RECUPERACION', NULL, 'Descanso pasivo - Recuperación completa sin actividad física', NOW(), NOW()),
('Descanso act', 'Descanso activo', 'RECUPERACION', 40.00, 'Recuperación activa - Actividades de muy baja intensidad (masaje, sauna, vídeo, juegos)', NOW(), NOW()),
('Relajación', 'Relajación', 'RECUPERACION', NULL, 'Técnicas de relajación - Estiramientos, respiración, yoga', NOW(), NOW()),

-- ETAPAS (valores de planBD.txt)
('Básica', 'Etapa básica', 'ETAPA', NULL, 'Etapa de preparación básica/general', NOW(), NOW()),
('Específica', 'Etapa específica', 'ETAPA', NULL, 'Etapa de preparación específica', NOW(), NOW()),
('Especial', 'Etapa especial', 'ETAPA', NULL, 'Etapa especial/pre-competitiva', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
