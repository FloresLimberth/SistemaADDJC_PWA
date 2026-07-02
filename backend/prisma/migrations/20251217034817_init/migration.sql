-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMINISTRADOR', 'COMITE_TECNICO', 'ENTRENADOR', 'ATLETA');

-- CreateEnum
CREATE TYPE "CategoriaPeso" AS ENUM ('MENOS_60K', 'MENOS_66K', 'MENOS_73K', 'MENOS_81K', 'MENOS_90K', 'MENOS_100K', 'MAS_100K');

-- CreateEnum
CREATE TYPE "EstadoMacrociclo" AS ENUM ('PLANIFICADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EtapaMesociclo" AS ENUM ('PREPARACION_GENERAL', 'PREPARACION_ESPECIFICA', 'COMPETITIVA', 'TRANSICION');

-- CreateEnum
CREATE TYPE "TipoMicrociclo" AS ENUM ('CARGA', 'DESCARGA', 'CHOQUE', 'RECUPERACION', 'COMPETITIVO');

-- CreateEnum
CREATE TYPE "SentidoCarga" AS ENUM ('ASCENDENTE', 'DESCENDENTE', 'MANTENIMIENTO');

-- CreateEnum
CREATE TYPE "CreadoPor" AS ENUM ('COMITE_TECNICO', 'SISTEMA_ALGORITMO');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "TipoSesion" AS ENUM ('ENTRENAMIENTO', 'TEST', 'RECUPERACION', 'DESCANSO', 'COMPETENCIA');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANANA', 'TARDE', 'COMPLETO');

-- CreateEnum
CREATE TYPE "TipoPlanificacion" AS ENUM ('INICIAL', 'AJUSTE_AUTOMATICO');

-- CreateEnum
CREATE TYPE "TipoRecomendacion" AS ENUM ('INICIAL', 'AJUSTE_POST_TEST', 'ALERTA_FATIGA', 'AJUSTE_LESION', 'ALERTA_DESVIACION_CARGA', 'PERSONALIZACION_TACTICA', 'NUTRICIONAL', 'AJUSTE_PLANIFICACION');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "EstadoRecomendacion" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'CUMPLIDA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('RECOMENDACION_ALGORITMO', 'ALERTA_FATIGA', 'ALERTA_LESION', 'PLANIFICACION_APROBADA', 'PLANIFICACION_MODIFICADA', 'SESION_PROXIMA', 'TEST_PENDIENTE', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoLesion" AS ENUM ('MOLESTIA', 'DOLOR_AGUDO', 'LESION_CRONICA', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('BAJO_RENDIMIENTO', 'PESO_FUERA_RANGO', 'LESION_DETECTADA', 'TEST_FALLIDO', 'FATIGA_ALTA', 'DESVIACION_CARGA');

-- CreateEnum
CREATE TYPE "Severidad" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "PeriodoTolerancia" AS ENUM ('GENERAL', 'ESPECIFICA_I', 'ESPECIFICA_II', 'PRE_COMPETITIVA', 'COMPETITIVA');

-- CreateEnum
CREATE TYPE "TipoEjercicio" AS ENUM ('FISICO', 'TECNICO_TACHI', 'TECNICO_NE', 'RESISTENCIA', 'VELOCIDAD');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "ci" VARCHAR(20) NOT NULL,
    "nombreCompleto" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atletas" (
    "id" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT NOT NULL,
    "municipio" VARCHAR(100) NOT NULL,
    "club" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "peso" VARCHAR(20) NOT NULL,
    "fechaNacimiento" DATE NOT NULL,
    "edad" INTEGER NOT NULL,
    "direccion" TEXT,
    "telefono" VARCHAR(50),
    "entrenadorAsignadoId" BIGINT,
    "categoriaPeso" "CategoriaPeso",
    "pesoActual" DECIMAL(5,2),
    "fcReposo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atletas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrenadores" (
    "id" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT NOT NULL,
    "municipio" VARCHAR(100) NOT NULL,
    "especialidad" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrenadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macrociclos" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "temporada" VARCHAR(50) NOT NULL,
    "equipo" VARCHAR(100) NOT NULL,
    "categoriaObjetivo" VARCHAR(50) NOT NULL,
    "objetivo1" TEXT NOT NULL,
    "objetivo2" TEXT NOT NULL,
    "objetivo3" TEXT NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "estado" "EstadoMacrociclo" NOT NULL,
    "totalMicrociclos" INTEGER NOT NULL,
    "totalSesiones" INTEGER NOT NULL,
    "totalHoras" DECIMAL(10,2) NOT NULL,
    "creadoPor" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "macrociclos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesociclos" (
    "id" BIGSERIAL NOT NULL,
    "macrocicloId" BIGINT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "numeroMesociclo" INTEGER NOT NULL,
    "etapa" "EtapaMesociclo" NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "objetivoFisico" TEXT NOT NULL,
    "objetivoTecnico" TEXT NOT NULL,
    "objetivoTactico" TEXT NOT NULL,
    "totalMicrociclos" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mesociclos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microciclos" (
    "id" BIGSERIAL NOT NULL,
    "mesocicloId" BIGINT,
    "numeroMicrociclo" INTEGER,
    "numeroGlobalMicrociclo" INTEGER NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "tipoMicrociclo" "TipoMicrociclo" NOT NULL,
    "volumenTotal" DECIMAL(10,2) NOT NULL,
    "intensidadPromedio" DECIMAL(5,2) NOT NULL,
    "objetivoSemanal" TEXT NOT NULL,
    "observaciones" TEXT,
    "creadoPor" "CreadoPor" NOT NULL DEFAULT 'COMITE_TECNICO',
    "mediaVolumen" INTEGER,
    "mediaIntensidad" INTEGER,
    "sentidoVolumen" "SentidoCarga",
    "sentidoIntensidad" "SentidoCarga",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "microciclos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" BIGSERIAL NOT NULL,
    "microcicloId" BIGINT NOT NULL,
    "fecha" DATE NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "numeroSesion" INTEGER NOT NULL,
    "tipoSesion" "TipoSesion" NOT NULL,
    "turno" "Turno" NOT NULL DEFAULT 'COMPLETO',
    "tipoPlanificacion" "TipoPlanificacion" NOT NULL DEFAULT 'INICIAL',
    "sesionBaseId" BIGINT,
    "creadoPor" "CreadoPor" NOT NULL DEFAULT 'COMITE_TECNICO',
    "duracionPlanificada" INTEGER NOT NULL,
    "volumenPlanificado" INTEGER NOT NULL,
    "intensidadPlanificada" INTEGER NOT NULL,
    "fcObjetivo" INTEGER,
    "relacionVI" VARCHAR(20) NOT NULL,
    "duracionReal" INTEGER,
    "volumenReal" INTEGER,
    "intensidadReal" INTEGER,
    "contenidoFisico" TEXT NOT NULL,
    "contenidoTecnico" TEXT NOT NULL,
    "contenidoTactico" TEXT NOT NULL,
    "calentamiento" TEXT,
    "partePrincipal" TEXT,
    "vueltaCalma" TEXT,
    "observaciones" TEXT,
    "materialNecesario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests_fisicos" (
    "id" BIGSERIAL NOT NULL,
    "atletaId" BIGINT NOT NULL,
    "entrenadorRegistroId" BIGINT NOT NULL,
    "sesionId" BIGINT,
    "fechaTest" DATE NOT NULL,
    "microcicloId" BIGINT,
    "pressBanca" DECIMAL(5,2),
    "pressBancaIntensidad" DECIMAL(5,2),
    "tiron" DECIMAL(5,2),
    "tironIntensidad" DECIMAL(5,2),
    "sentadilla" DECIMAL(5,2),
    "sentadillaIntensidad" DECIMAL(5,2),
    "barraFija" INTEGER,
    "paralelas" INTEGER,
    "navettePalier" DECIMAL(5,2),
    "navetteVO2max" DECIMAL(5,2),
    "test1500m" TIME,
    "test1500mVO2max" DECIMAL(5,2),
    "observaciones" TEXT,
    "condicionesTest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_fisicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_post_entrenamiento" (
    "id" BIGSERIAL NOT NULL,
    "atletaId" BIGINT NOT NULL,
    "sesionId" BIGINT NOT NULL,
    "entrenadorRegistroId" BIGINT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asistio" BOOLEAN NOT NULL,
    "motivoInasistencia" TEXT,
    "ejerciciosCompletados" DECIMAL(5,2) NOT NULL,
    "intensidadAlcanzada" DECIMAL(5,2) NOT NULL,
    "duracionReal" INTEGER NOT NULL,
    "rpe" INTEGER NOT NULL,
    "calidadSueno" INTEGER NOT NULL,
    "horasSueno" DECIMAL(3,1),
    "estadoAnimico" INTEGER NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_post_entrenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dolencias" (
    "id" BIGSERIAL NOT NULL,
    "registroPostEntrenamientoId" BIGINT NOT NULL,
    "zona" VARCHAR(100) NOT NULL,
    "nivel" INTEGER NOT NULL,
    "descripcion" TEXT,
    "tipoLesion" "TipoLesion",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dolencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recomendaciones" (
    "id" BIGSERIAL NOT NULL,
    "atletaId" BIGINT NOT NULL,
    "microcicloAfectadoId" BIGINT,
    "tipo" "TipoRecomendacion" NOT NULL,
    "prioridad" "Prioridad" NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "datosAnalisis" JSONB,
    "accionSugerida" TEXT,
    "sesionesAfectadas" JSONB,
    "generoPlanificacion" BOOLEAN NOT NULL DEFAULT false,
    "sesionGeneradaId" BIGINT,
    "estado" "EstadoRecomendacion" NOT NULL DEFAULT 'PENDIENTE',
    "revisadoPor" BIGINT,
    "fechaRevision" TIMESTAMP(3),
    "comentarioRevision" TEXT,
    "aplicadoPor" BIGINT,
    "fechaAplicacion" TIMESTAMP(3),
    "registroPostEntrenamientoId" BIGINT,
    "testFisicoId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recomendaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" BIGSERIAL NOT NULL,
    "destinatarioId" BIGINT NOT NULL,
    "recomendacionId" BIGINT,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fechaLeida" TIMESTAMP(3),
    "prioridad" "Prioridad" NOT NULL DEFAULT 'MEDIA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_sistema" (
    "id" BIGSERIAL NOT NULL,
    "atletaId" BIGINT NOT NULL,
    "destinatarioId" BIGINT NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "severidad" "Severidad" NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fechaLeida" TIMESTAMP(3),
    "datosContexto" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tolerancias_peso" (
    "id" BIGSERIAL NOT NULL,
    "categoriaPeso" VARCHAR(10) NOT NULL,
    "periodo" "PeriodoTolerancia" NOT NULL,
    "toleranciaLunes" DECIMAL(4,2) NOT NULL,
    "toleranciaViernes" DECIMAL(4,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tolerancias_peso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_ejercicios" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "tipo" "TipoEjercicio" NOT NULL,
    "subtipo" VARCHAR(100),
    "descripcion" TEXT,
    "instrucciones" TEXT,
    "materialNecesario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_ejercicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_atleta_microciclo" (
    "id" BIGSERIAL NOT NULL,
    "atletaId" BIGINT NOT NULL,
    "microcicloId" BIGINT NOT NULL,
    "asignadoPor" BIGINT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_atleta_microciclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_passwords" (
    "id" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reset_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias_acceso" (
    "id" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT,
    "accion" VARCHAR(100) NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "userAgent" TEXT NOT NULL,
    "exito" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_ci_key" ON "usuarios"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_ci_idx" ON "usuarios"("ci");

-- CreateIndex
CREATE INDEX "usuarios_rol_idx" ON "usuarios"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "atletas_usuarioId_key" ON "atletas"("usuarioId");

-- CreateIndex
CREATE INDEX "atletas_usuarioId_idx" ON "atletas"("usuarioId");

-- CreateIndex
CREATE INDEX "atletas_entrenadorAsignadoId_idx" ON "atletas"("entrenadorAsignadoId");

-- CreateIndex
CREATE INDEX "atletas_club_idx" ON "atletas"("club");

-- CreateIndex
CREATE UNIQUE INDEX "entrenadores_usuarioId_key" ON "entrenadores"("usuarioId");

-- CreateIndex
CREATE INDEX "entrenadores_usuarioId_idx" ON "entrenadores"("usuarioId");

-- CreateIndex
CREATE INDEX "macrociclos_estado_idx" ON "macrociclos"("estado");

-- CreateIndex
CREATE INDEX "macrociclos_creadoPor_idx" ON "macrociclos"("creadoPor");

-- CreateIndex
CREATE INDEX "mesociclos_macrocicloId_idx" ON "mesociclos"("macrocicloId");

-- CreateIndex
CREATE INDEX "microciclos_mesocicloId_idx" ON "microciclos"("mesocicloId");

-- CreateIndex
CREATE INDEX "microciclos_fechaInicio_idx" ON "microciclos"("fechaInicio");

-- CreateIndex
CREATE INDEX "sesiones_microcicloId_idx" ON "sesiones"("microcicloId");

-- CreateIndex
CREATE INDEX "sesiones_fecha_idx" ON "sesiones"("fecha");

-- CreateIndex
CREATE INDEX "sesiones_sesionBaseId_idx" ON "sesiones"("sesionBaseId");

-- CreateIndex
CREATE INDEX "tests_fisicos_atletaId_idx" ON "tests_fisicos"("atletaId");

-- CreateIndex
CREATE INDEX "tests_fisicos_entrenadorRegistroId_idx" ON "tests_fisicos"("entrenadorRegistroId");

-- CreateIndex
CREATE INDEX "tests_fisicos_fechaTest_idx" ON "tests_fisicos"("fechaTest");

-- CreateIndex
CREATE INDEX "registros_post_entrenamiento_atletaId_idx" ON "registros_post_entrenamiento"("atletaId");

-- CreateIndex
CREATE INDEX "registros_post_entrenamiento_sesionId_idx" ON "registros_post_entrenamiento"("sesionId");

-- CreateIndex
CREATE INDEX "registros_post_entrenamiento_fechaRegistro_idx" ON "registros_post_entrenamiento"("fechaRegistro");

-- CreateIndex
CREATE INDEX "dolencias_registroPostEntrenamientoId_idx" ON "dolencias"("registroPostEntrenamientoId");

-- CreateIndex
CREATE INDEX "recomendaciones_atletaId_idx" ON "recomendaciones"("atletaId");

-- CreateIndex
CREATE INDEX "recomendaciones_estado_idx" ON "recomendaciones"("estado");

-- CreateIndex
CREATE INDEX "recomendaciones_prioridad_idx" ON "recomendaciones"("prioridad");

-- CreateIndex
CREATE INDEX "notificaciones_destinatarioId_leida_idx" ON "notificaciones"("destinatarioId", "leida");

-- CreateIndex
CREATE INDEX "alertas_sistema_destinatarioId_leida_idx" ON "alertas_sistema"("destinatarioId", "leida");

-- CreateIndex
CREATE INDEX "alertas_sistema_atletaId_idx" ON "alertas_sistema"("atletaId");

-- CreateIndex
CREATE INDEX "alertas_sistema_tipo_idx" ON "alertas_sistema"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "tolerancias_peso_categoriaPeso_periodo_key" ON "tolerancias_peso"("categoriaPeso", "periodo");

-- CreateIndex
CREATE INDEX "catalogo_ejercicios_tipo_idx" ON "catalogo_ejercicios"("tipo");

-- CreateIndex
CREATE INDEX "catalogo_ejercicios_subtipo_idx" ON "catalogo_ejercicios"("subtipo");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_atleta_microciclo_atletaId_microcicloId_key" ON "asignaciones_atleta_microciclo"("atletaId", "microcicloId");

-- CreateIndex
CREATE UNIQUE INDEX "reset_passwords_token_key" ON "reset_passwords"("token");

-- CreateIndex
CREATE INDEX "reset_passwords_token_idx" ON "reset_passwords"("token");

-- CreateIndex
CREATE INDEX "auditorias_acceso_usuarioId_idx" ON "auditorias_acceso"("usuarioId");

-- CreateIndex
CREATE INDEX "auditorias_acceso_createdAt_idx" ON "auditorias_acceso"("createdAt");

-- AddForeignKey
ALTER TABLE "atletas" ADD CONSTRAINT "atletas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atletas" ADD CONSTRAINT "atletas_entrenadorAsignadoId_fkey" FOREIGN KEY ("entrenadorAsignadoId") REFERENCES "entrenadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrenadores" ADD CONSTRAINT "entrenadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "macrociclos" ADD CONSTRAINT "macrociclos_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesociclos" ADD CONSTRAINT "mesociclos_macrocicloId_fkey" FOREIGN KEY ("macrocicloId") REFERENCES "macrociclos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microciclos" ADD CONSTRAINT "microciclos_mesocicloId_fkey" FOREIGN KEY ("mesocicloId") REFERENCES "mesociclos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_microcicloId_fkey" FOREIGN KEY ("microcicloId") REFERENCES "microciclos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_sesionBaseId_fkey" FOREIGN KEY ("sesionBaseId") REFERENCES "sesiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests_fisicos" ADD CONSTRAINT "tests_fisicos_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "atletas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests_fisicos" ADD CONSTRAINT "tests_fisicos_entrenadorRegistroId_fkey" FOREIGN KEY ("entrenadorRegistroId") REFERENCES "entrenadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests_fisicos" ADD CONSTRAINT "tests_fisicos_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "sesiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests_fisicos" ADD CONSTRAINT "tests_fisicos_microcicloId_fkey" FOREIGN KEY ("microcicloId") REFERENCES "microciclos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_post_entrenamiento" ADD CONSTRAINT "registros_post_entrenamiento_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "atletas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_post_entrenamiento" ADD CONSTRAINT "registros_post_entrenamiento_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "sesiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_post_entrenamiento" ADD CONSTRAINT "registros_post_entrenamiento_entrenadorRegistroId_fkey" FOREIGN KEY ("entrenadorRegistroId") REFERENCES "entrenadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dolencias" ADD CONSTRAINT "dolencias_registroPostEntrenamientoId_fkey" FOREIGN KEY ("registroPostEntrenamientoId") REFERENCES "registros_post_entrenamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendaciones" ADD CONSTRAINT "recomendaciones_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "atletas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendaciones" ADD CONSTRAINT "recomendaciones_microcicloAfectadoId_fkey" FOREIGN KEY ("microcicloAfectadoId") REFERENCES "microciclos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendaciones" ADD CONSTRAINT "recomendaciones_sesionGeneradaId_fkey" FOREIGN KEY ("sesionGeneradaId") REFERENCES "sesiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendaciones" ADD CONSTRAINT "recomendaciones_revisadoPor_fkey" FOREIGN KEY ("revisadoPor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendaciones" ADD CONSTRAINT "recomendaciones_aplicadoPor_fkey" FOREIGN KEY ("aplicadoPor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendaciones" ADD CONSTRAINT "recomendaciones_registroPostEntrenamientoId_fkey" FOREIGN KEY ("registroPostEntrenamientoId") REFERENCES "registros_post_entrenamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendaciones" ADD CONSTRAINT "recomendaciones_testFisicoId_fkey" FOREIGN KEY ("testFisicoId") REFERENCES "tests_fisicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_recomendacionId_fkey" FOREIGN KEY ("recomendacionId") REFERENCES "recomendaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_sistema" ADD CONSTRAINT "alertas_sistema_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "atletas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_sistema" ADD CONSTRAINT "alertas_sistema_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_atleta_microciclo" ADD CONSTRAINT "asignaciones_atleta_microciclo_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "atletas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_atleta_microciclo" ADD CONSTRAINT "asignaciones_atleta_microciclo_microcicloId_fkey" FOREIGN KEY ("microcicloId") REFERENCES "microciclos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_atleta_microciclo" ADD CONSTRAINT "asignaciones_atleta_microciclo_asignadoPor_fkey" FOREIGN KEY ("asignadoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_passwords" ADD CONSTRAINT "reset_passwords_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias_acceso" ADD CONSTRAINT "auditorias_acceso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
