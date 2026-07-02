--
-- PostgreSQL database dump
--

\restrict SW6zxWIsrLWejn5DubeLO3a33Sf6eirYeV7v4eNJgQOBwptQCzLcxGirNN9Yebw

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CategoriaPeso; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CategoriaPeso" AS ENUM (
    'MENOS_60K',
    'MENOS_66K',
    'MENOS_73K',
    'MENOS_81K',
    'MENOS_90K',
    'MENOS_100K',
    'MAS_100K'
);


--
-- Name: CreadoPor; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CreadoPor" AS ENUM (
    'COMITE_TECNICO',
    'SISTEMA_ALGORITMO'
);


--
-- Name: DiaSemana; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DiaSemana" AS ENUM (
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
    'DOMINGO'
);


--
-- Name: EstadoMacrociclo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EstadoMacrociclo" AS ENUM (
    'PLANIFICADO',
    'EN_CURSO',
    'COMPLETADO',
    'CANCELADO'
);


--
-- Name: EstadoRecomendacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EstadoRecomendacion" AS ENUM (
    'PENDIENTE',
    'EN_PROCESO',
    'CUMPLIDA',
    'RECHAZADA'
);


--
-- Name: EtapaMesociclo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EtapaMesociclo" AS ENUM (
    'PREPARACION_GENERAL',
    'PREPARACION_ESPECIFICA',
    'COMPETITIVA',
    'TRANSICION'
);


--
-- Name: PeriodoTolerancia; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PeriodoTolerancia" AS ENUM (
    'GENERAL',
    'ESPECIFICA_I',
    'ESPECIFICA_II',
    'PRE_COMPETITIVA',
    'COMPETITIVA'
);


--
-- Name: Prioridad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Prioridad" AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'CRITICA'
);


--
-- Name: RolUsuario; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RolUsuario" AS ENUM (
    'ADMINISTRADOR',
    'COMITE_TECNICO',
    'ENTRENADOR',
    'ATLETA'
);


--
-- Name: SentidoCarga; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SentidoCarga" AS ENUM (
    'ASCENDENTE',
    'DESCENDENTE',
    'MANTENIMIENTO'
);


--
-- Name: Severidad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Severidad" AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'CRITICA'
);


--
-- Name: TipoAlerta; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoAlerta" AS ENUM (
    'BAJO_RENDIMIENTO',
    'PESO_FUERA_RANGO',
    'LESION_DETECTADA',
    'TEST_FALLIDO',
    'FATIGA_ALTA',
    'DESVIACION_CARGA'
);


--
-- Name: TipoEjercicio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoEjercicio" AS ENUM (
    'FISICO',
    'TECNICO_TACHI',
    'TECNICO_NE',
    'RESISTENCIA',
    'VELOCIDAD'
);


--
-- Name: TipoLesion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoLesion" AS ENUM (
    'MOLESTIA',
    'DOLOR_AGUDO',
    'LESION_CRONICA',
    'OTRO'
);


--
-- Name: TipoMicrociclo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoMicrociclo" AS ENUM (
    'CARGA',
    'DESCARGA',
    'CHOQUE',
    'RECUPERACION',
    'COMPETITIVO'
);


--
-- Name: TipoNotificacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoNotificacion" AS ENUM (
    'RECOMENDACION_ALGORITMO',
    'ALERTA_FATIGA',
    'ALERTA_LESION',
    'PLANIFICACION_APROBADA',
    'PLANIFICACION_MODIFICADA',
    'SESION_PROXIMA',
    'TEST_PENDIENTE',
    'OTRO'
);


--
-- Name: TipoPlanificacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoPlanificacion" AS ENUM (
    'INICIAL',
    'AJUSTE_AUTOMATICO'
);


--
-- Name: TipoRecomendacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoRecomendacion" AS ENUM (
    'INICIAL',
    'AJUSTE_POST_TEST',
    'ALERTA_FATIGA',
    'AJUSTE_LESION',
    'ALERTA_DESVIACION_CARGA',
    'PERSONALIZACION_TACTICA',
    'NUTRICIONAL',
    'AJUSTE_PLANIFICACION'
);


--
-- Name: TipoSesion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoSesion" AS ENUM (
    'ENTRENAMIENTO',
    'TEST',
    'RECUPERACION',
    'DESCANSO',
    'COMPETENCIA'
);


--
-- Name: Turno; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Turno" AS ENUM (
    'MANANA',
    'TARDE',
    'COMPLETO'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: alertas_sistema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alertas_sistema (
    id bigint NOT NULL,
    "atletaId" bigint NOT NULL,
    "destinatarioId" bigint NOT NULL,
    tipo public."TipoAlerta" NOT NULL,
    titulo character varying(255) NOT NULL,
    descripcion text NOT NULL,
    severidad public."Severidad" NOT NULL,
    leida boolean DEFAULT false NOT NULL,
    "fechaLeida" timestamp(3) without time zone,
    "datosContexto" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: alertas_sistema_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alertas_sistema_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alertas_sistema_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alertas_sistema_id_seq OWNED BY public.alertas_sistema.id;


--
-- Name: asignaciones_atleta_microciclo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asignaciones_atleta_microciclo (
    id bigint NOT NULL,
    "atletaId" bigint NOT NULL,
    "microcicloId" bigint NOT NULL,
    "asignadoPor" bigint NOT NULL,
    "fechaAsignacion" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    observaciones text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: asignaciones_atleta_microciclo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asignaciones_atleta_microciclo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asignaciones_atleta_microciclo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asignaciones_atleta_microciclo_id_seq OWNED BY public.asignaciones_atleta_microciclo.id;


--
-- Name: atletas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.atletas (
    id bigint NOT NULL,
    "usuarioId" bigint NOT NULL,
    municipio character varying(100) NOT NULL,
    club character varying(100) NOT NULL,
    categoria character varying(50) NOT NULL,
    "fechaNacimiento" date NOT NULL,
    edad integer NOT NULL,
    direccion text,
    telefono character varying(50),
    "entrenadorAsignadoId" bigint,
    "categoriaPeso" public."CategoriaPeso" NOT NULL,
    "pesoActual" numeric(5,2),
    "fcReposo" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT check_edad_range CHECK (((edad >= 5) AND (edad <= 100))),
    CONSTRAINT check_fc_reposo_range CHECK ((("fcReposo" IS NULL) OR (("fcReposo" >= 30) AND ("fcReposo" <= 100)))),
    CONSTRAINT check_peso_actual_positive CHECK ((("pesoActual" IS NULL) OR ("pesoActual" > (0)::numeric)))
);


--
-- Name: atletas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.atletas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: atletas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.atletas_id_seq OWNED BY public.atletas.id;


--
-- Name: auditorias_acceso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditorias_acceso (
    id bigint NOT NULL,
    "usuarioId" bigint,
    accion character varying(100) NOT NULL,
    ip character varying(45) NOT NULL,
    "userAgent" text NOT NULL,
    exito boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: auditorias_acceso_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auditorias_acceso_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auditorias_acceso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auditorias_acceso_id_seq OWNED BY public.auditorias_acceso.id;


--
-- Name: baremos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.baremos (
    id bigint NOT NULL,
    tipo character varying(20) NOT NULL,
    nivel smallint NOT NULL,
    "porcentajeMin" numeric(5,2) NOT NULL,
    "porcentajeMax" numeric(5,2) NOT NULL,
    "minutosMin" integer,
    "minutosMax" integer,
    "fcMin" integer,
    "fcMax" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: baremos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.baremos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: baremos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.baremos_id_seq OWNED BY public.baremos.id;


--
-- Name: catalogo_ejercicios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalogo_ejercicios (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    tipo public."TipoEjercicio" NOT NULL,
    subtipo character varying(100),
    descripcion text,
    instrucciones text,
    "materialNecesario" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    categoria character varying(50),
    "duracionMinutos" integer,
    "intensidadSugerida" numeric(5,2),
    "sistemaEnergetico" character varying(50)
);


--
-- Name: catalogo_ejercicios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.catalogo_ejercicios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: catalogo_ejercicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.catalogo_ejercicios_id_seq OWNED BY public.catalogo_ejercicios.id;


--
-- Name: dolencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dolencias (
    id bigint NOT NULL,
    "registroPostEntrenamientoId" bigint NOT NULL,
    zona character varying(100) NOT NULL,
    nivel integer NOT NULL,
    descripcion text,
    "tipoLesion" public."TipoLesion",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "fechaRecuperacion" timestamp(3) without time zone,
    recuperado boolean DEFAULT false NOT NULL,
    "recuperadoPor" bigint
);


--
-- Name: dolencias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dolencias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dolencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dolencias_id_seq OWNED BY public.dolencias.id;


--
-- Name: entrenadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entrenadores (
    id bigint NOT NULL,
    "usuarioId" bigint NOT NULL,
    municipio character varying(100) NOT NULL,
    especialidad character varying(100),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: entrenadores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.entrenadores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: entrenadores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.entrenadores_id_seq OWNED BY public.entrenadores.id;


--
-- Name: macrociclos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.macrociclos (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    temporada character varying(50) NOT NULL,
    equipo character varying(100) NOT NULL,
    "categoriaObjetivo" character varying(50) NOT NULL,
    objetivo1 text NOT NULL,
    objetivo2 text NOT NULL,
    objetivo3 text NOT NULL,
    "fechaInicio" date NOT NULL,
    "fechaFin" date NOT NULL,
    estado public."EstadoMacrociclo" NOT NULL,
    "totalMicrociclos" integer NOT NULL,
    "totalSesiones" integer NOT NULL,
    "totalHoras" numeric(10,2) NOT NULL,
    "creadoPor" bigint NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT check_fechas_macrociclo CHECK (("fechaFin" > "fechaInicio")),
    CONSTRAINT check_total_horas_positive CHECK (("totalHoras" > (0)::numeric)),
    CONSTRAINT check_total_microciclos_positive CHECK (("totalMicrociclos" > 0)),
    CONSTRAINT check_total_sesiones_positive CHECK (("totalSesiones" > 0))
);


--
-- Name: macrociclos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.macrociclos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: macrociclos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.macrociclos_id_seq OWNED BY public.macrociclos.id;


--
-- Name: mesociclos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mesociclos (
    id bigint NOT NULL,
    "macrocicloId" bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    "numeroMesociclo" integer NOT NULL,
    etapa public."EtapaMesociclo" NOT NULL,
    "fechaInicio" date NOT NULL,
    "fechaFin" date NOT NULL,
    "objetivoFisico" text NOT NULL,
    "objetivoTecnico" text NOT NULL,
    "objetivoTactico" text NOT NULL,
    "totalMicrociclos" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT check_fechas_mesociclo CHECK (("fechaFin" > "fechaInicio"))
);


--
-- Name: mesociclos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mesociclos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mesociclos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mesociclos_id_seq OWNED BY public.mesociclos.id;


--
-- Name: microciclos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.microciclos (
    id bigint NOT NULL,
    "mesocicloId" bigint,
    "numeroMicrociclo" integer,
    "numeroGlobalMicrociclo" integer NOT NULL,
    "fechaInicio" date NOT NULL,
    "fechaFin" date NOT NULL,
    "tipoMicrociclo" public."TipoMicrociclo" NOT NULL,
    "volumenTotal" numeric(10,2) NOT NULL,
    "intensidadPromedio" numeric(5,2) NOT NULL,
    "objetivoSemanal" text NOT NULL,
    observaciones text,
    "creadoPor" public."CreadoPor" DEFAULT 'COMITE_TECNICO'::public."CreadoPor" NOT NULL,
    "mediaVolumen" numeric(5,2),
    "mediaIntensidad" numeric(5,2),
    "sentidoVolumen" public."SentidoCarga",
    "sentidoIntensidad" public."SentidoCarga",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "iCarga1" numeric(5,2),
    "iCarga1Nivel" smallint,
    "iCarga2" numeric(5,2),
    "iCarga2Nivel" smallint,
    "vCarga1" numeric(5,2),
    "vCarga1Nivel" smallint,
    "vCarga2" numeric(5,2),
    "vCarga2Nivel" smallint,
    CONSTRAINT check_fechas_microciclo CHECK (("fechaFin" > "fechaInicio"))
);


--
-- Name: microciclos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.microciclos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: microciclos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.microciclos_id_seq OWNED BY public.microciclos.id;


--
-- Name: nomenclatura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nomenclatura (
    id bigint NOT NULL,
    codigo character varying(20) NOT NULL,
    "nombreCompleto" character varying(100) NOT NULL,
    categoria character varying(50) NOT NULL,
    descripcion text,
    "wintPercent" numeric(5,2),
    "sistemaEnergetico" character varying(50),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: nomenclatura_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nomenclatura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nomenclatura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nomenclatura_id_seq OWNED BY public.nomenclatura.id;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificaciones (
    id bigint NOT NULL,
    "destinatarioId" bigint NOT NULL,
    "recomendacionId" bigint,
    tipo public."TipoNotificacion" NOT NULL,
    titulo character varying(255) NOT NULL,
    mensaje text NOT NULL,
    leida boolean DEFAULT false NOT NULL,
    "fechaLeida" timestamp(3) without time zone,
    prioridad public."Prioridad" DEFAULT 'MEDIA'::public."Prioridad" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notificaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- Name: recomendaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recomendaciones (
    id bigint NOT NULL,
    "atletaId" bigint NOT NULL,
    "microcicloAfectadoId" bigint,
    tipo public."TipoRecomendacion" NOT NULL,
    prioridad public."Prioridad" NOT NULL,
    titulo character varying(255) NOT NULL,
    mensaje text NOT NULL,
    "datosAnalisis" jsonb,
    "accionSugerida" text,
    "sesionesAfectadas" jsonb,
    "generoPlanificacion" boolean DEFAULT false NOT NULL,
    "sesionGeneradaId" bigint,
    estado public."EstadoRecomendacion" DEFAULT 'PENDIENTE'::public."EstadoRecomendacion" NOT NULL,
    "revisadoPor" bigint,
    "fechaRevision" timestamp(3) without time zone,
    "comentarioRevision" text,
    "aplicadoPor" bigint,
    "fechaAplicacion" timestamp(3) without time zone,
    "registroPostEntrenamientoId" bigint,
    "testFisicoId" bigint,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: recomendaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recomendaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recomendaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recomendaciones_id_seq OWNED BY public.recomendaciones.id;


--
-- Name: registros_post_entrenamiento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registros_post_entrenamiento (
    id bigint NOT NULL,
    "atletaId" bigint NOT NULL,
    "sesionId" bigint NOT NULL,
    "entrenadorRegistroId" bigint NOT NULL,
    "fechaRegistro" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    asistio boolean NOT NULL,
    "motivoInasistencia" text,
    "ejerciciosCompletados" numeric(5,2) NOT NULL,
    "intensidadAlcanzada" numeric(5,2) NOT NULL,
    "duracionReal" integer NOT NULL,
    rpe integer NOT NULL,
    "calidadSueno" integer NOT NULL,
    "horasSueno" numeric(3,1),
    "estadoAnimico" integer NOT NULL,
    observaciones text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT check_calidad_sueno_range CHECK ((("calidadSueno" >= 1) AND ("calidadSueno" <= 10))),
    CONSTRAINT check_duracion_real_positive CHECK (("duracionReal" > 0)),
    CONSTRAINT check_ejercicios_completados_range CHECK ((("ejerciciosCompletados" >= (0)::numeric) AND ("ejerciciosCompletados" <= (100)::numeric))),
    CONSTRAINT check_estado_animico_range CHECK ((("estadoAnimico" >= 1) AND ("estadoAnimico" <= 10))),
    CONSTRAINT check_horas_sueno_range CHECK ((("horasSueno" IS NULL) OR (("horasSueno" >= (0)::numeric) AND ("horasSueno" <= (24)::numeric)))),
    CONSTRAINT check_intensidad_alcanzada_range CHECK ((("intensidadAlcanzada" >= (0)::numeric) AND ("intensidadAlcanzada" <= (100)::numeric))),
    CONSTRAINT check_rpe_range CHECK (((rpe >= 1) AND (rpe <= 10)))
);


--
-- Name: registros_post_entrenamiento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registros_post_entrenamiento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registros_post_entrenamiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registros_post_entrenamiento_id_seq OWNED BY public.registros_post_entrenamiento.id;


--
-- Name: reset_passwords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reset_passwords (
    id bigint NOT NULL,
    "usuarioId" bigint NOT NULL,
    token character varying(255) NOT NULL,
    "expiraEn" timestamp(3) without time zone NOT NULL,
    usado boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: reset_passwords_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reset_passwords_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reset_passwords_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reset_passwords_id_seq OWNED BY public.reset_passwords.id;


--
-- Name: sesiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesiones (
    id bigint NOT NULL,
    "microcicloId" bigint NOT NULL,
    fecha date NOT NULL,
    "diaSemana" public."DiaSemana" NOT NULL,
    "numeroSesion" integer NOT NULL,
    "tipoSesion" public."TipoSesion" NOT NULL,
    turno public."Turno" DEFAULT 'COMPLETO'::public."Turno" NOT NULL,
    "tipoPlanificacion" public."TipoPlanificacion" DEFAULT 'INICIAL'::public."TipoPlanificacion" NOT NULL,
    "sesionBaseId" bigint,
    "creadoPor" public."CreadoPor" DEFAULT 'COMITE_TECNICO'::public."CreadoPor" NOT NULL,
    "duracionPlanificada" integer NOT NULL,
    "volumenPlanificado" integer,
    "intensidadPlanificada" integer,
    "fcObjetivo" integer,
    "relacionVI" character varying(20),
    "duracionReal" integer,
    "volumenReal" integer,
    "intensidadReal" integer,
    "contenidoFisico" text,
    "contenidoTecnico" text,
    "contenidoTactico" text,
    calentamiento text,
    "partePrincipal" text,
    "vueltaCalma" text,
    observaciones text,
    "materialNecesario" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "zonaEsfuerzo" character varying(50),
    CONSTRAINT check_duracion_planificada_positive CHECK (("duracionPlanificada" > 0)),
    CONSTRAINT check_duracion_real_positive CHECK ((("duracionReal" IS NULL) OR ("duracionReal" > 0))),
    CONSTRAINT check_fc_objetivo_range CHECK ((("fcObjetivo" IS NULL) OR (("fcObjetivo" >= 40) AND ("fcObjetivo" <= 220)))),
    CONSTRAINT check_intensidad_planificada_range CHECK ((("intensidadPlanificada" >= 0) AND ("intensidadPlanificada" <= 100))),
    CONSTRAINT check_intensidad_real_range CHECK ((("intensidadReal" IS NULL) OR (("intensidadReal" >= 0) AND ("intensidadReal" <= 100)))),
    CONSTRAINT check_volumen_planificado_positive CHECK (("volumenPlanificado" > 0)),
    CONSTRAINT check_volumen_real_positive CHECK ((("volumenReal" IS NULL) OR ("volumenReal" > 0)))
);


--
-- Name: sesiones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sesiones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sesiones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sesiones_id_seq OWNED BY public.sesiones.id;


--
-- Name: tests_fisicos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tests_fisicos (
    id bigint NOT NULL,
    "atletaId" bigint NOT NULL,
    "entrenadorRegistroId" bigint NOT NULL,
    "sesionId" bigint NOT NULL,
    "fechaTest" date NOT NULL,
    "microcicloId" bigint NOT NULL,
    "pressBanca" numeric(5,2),
    "pressBancaIntensidad" numeric(5,2),
    tiron numeric(5,2),
    "tironIntensidad" numeric(5,2),
    sentadilla numeric(5,2),
    "sentadillaIntensidad" numeric(5,2),
    "barraFija" integer,
    paralelas integer,
    "navettePalier" numeric(5,2),
    "navetteVO2max" numeric(5,2),
    test1500m time without time zone,
    "test1500mVO2max" numeric(5,2),
    observaciones text,
    "condicionesTest" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    asistio boolean DEFAULT true NOT NULL,
    "motivoInasistencia" text,
    CONSTRAINT check_barra_fija_positive CHECK ((("barraFija" IS NULL) OR ("barraFija" >= 0))),
    CONSTRAINT check_paralelas_positive CHECK (((paralelas IS NULL) OR (paralelas >= 0))),
    CONSTRAINT check_press_banca_intensidad_range CHECK ((("pressBancaIntensidad" IS NULL) OR (("pressBancaIntensidad" >= (0)::numeric) AND ("pressBancaIntensidad" <= (100)::numeric)))),
    CONSTRAINT check_sentadilla_intensidad_range CHECK ((("sentadillaIntensidad" IS NULL) OR (("sentadillaIntensidad" >= (0)::numeric) AND ("sentadillaIntensidad" <= (100)::numeric)))),
    CONSTRAINT check_tiron_intensidad_range CHECK ((("tironIntensidad" IS NULL) OR (("tironIntensidad" >= (0)::numeric) AND ("tironIntensidad" <= (100)::numeric))))
);


--
-- Name: tests_fisicos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tests_fisicos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tests_fisicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tests_fisicos_id_seq OWNED BY public.tests_fisicos.id;


--
-- Name: tolerancias_peso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tolerancias_peso (
    id bigint NOT NULL,
    "categoriaPeso" character varying(10) NOT NULL,
    periodo public."PeriodoTolerancia" NOT NULL,
    "toleranciaLunes" numeric(4,2) NOT NULL,
    "toleranciaViernes" numeric(4,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT check_tolerancia_lunes_range CHECK ((("toleranciaLunes" >= (0)::numeric) AND ("toleranciaLunes" <= (100)::numeric))),
    CONSTRAINT check_tolerancia_viernes_range CHECK ((("toleranciaViernes" >= (0)::numeric) AND ("toleranciaViernes" <= (100)::numeric)))
);


--
-- Name: tolerancias_peso_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tolerancias_peso_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tolerancias_peso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tolerancias_peso_id_seq OWNED BY public.tolerancias_peso.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    ci character varying(20) NOT NULL,
    "nombreCompleto" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    contrasena character varying(255) NOT NULL,
    rol public."RolUsuario" NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    "fechaRegistro" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ultimoAcceso" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: zonas_esfuerzo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zonas_esfuerzo (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    "nombreCompleto" character varying(100) NOT NULL,
    categoria character varying(50) NOT NULL,
    "wintPercent" numeric(5,2),
    descripcion text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: zonas_esfuerzo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zonas_esfuerzo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zonas_esfuerzo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zonas_esfuerzo_id_seq OWNED BY public.zonas_esfuerzo.id;


--
-- Name: alertas_sistema id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alertas_sistema ALTER COLUMN id SET DEFAULT nextval('public.alertas_sistema_id_seq'::regclass);


--
-- Name: asignaciones_atleta_microciclo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignaciones_atleta_microciclo ALTER COLUMN id SET DEFAULT nextval('public.asignaciones_atleta_microciclo_id_seq'::regclass);


--
-- Name: atletas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atletas ALTER COLUMN id SET DEFAULT nextval('public.atletas_id_seq'::regclass);


--
-- Name: auditorias_acceso id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_acceso ALTER COLUMN id SET DEFAULT nextval('public.auditorias_acceso_id_seq'::regclass);


--
-- Name: baremos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baremos ALTER COLUMN id SET DEFAULT nextval('public.baremos_id_seq'::regclass);


--
-- Name: catalogo_ejercicios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalogo_ejercicios ALTER COLUMN id SET DEFAULT nextval('public.catalogo_ejercicios_id_seq'::regclass);


--
-- Name: dolencias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dolencias ALTER COLUMN id SET DEFAULT nextval('public.dolencias_id_seq'::regclass);


--
-- Name: entrenadores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrenadores ALTER COLUMN id SET DEFAULT nextval('public.entrenadores_id_seq'::regclass);


--
-- Name: macrociclos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.macrociclos ALTER COLUMN id SET DEFAULT nextval('public.macrociclos_id_seq'::regclass);


--
-- Name: mesociclos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesociclos ALTER COLUMN id SET DEFAULT nextval('public.mesociclos_id_seq'::regclass);


--
-- Name: microciclos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microciclos ALTER COLUMN id SET DEFAULT nextval('public.microciclos_id_seq'::regclass);


--
-- Name: nomenclatura id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nomenclatura ALTER COLUMN id SET DEFAULT nextval('public.nomenclatura_id_seq'::regclass);


--
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- Name: recomendaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones ALTER COLUMN id SET DEFAULT nextval('public.recomendaciones_id_seq'::regclass);


--
-- Name: registros_post_entrenamiento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_post_entrenamiento ALTER COLUMN id SET DEFAULT nextval('public.registros_post_entrenamiento_id_seq'::regclass);


--
-- Name: reset_passwords id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reset_passwords ALTER COLUMN id SET DEFAULT nextval('public.reset_passwords_id_seq'::regclass);


--
-- Name: sesiones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones ALTER COLUMN id SET DEFAULT nextval('public.sesiones_id_seq'::regclass);


--
-- Name: tests_fisicos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests_fisicos ALTER COLUMN id SET DEFAULT nextval('public.tests_fisicos_id_seq'::regclass);


--
-- Name: tolerancias_peso id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tolerancias_peso ALTER COLUMN id SET DEFAULT nextval('public.tolerancias_peso_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: zonas_esfuerzo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zonas_esfuerzo ALTER COLUMN id SET DEFAULT nextval('public.zonas_esfuerzo_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('dec202d7-2d32-49e8-b413-01c32a5a0c58', '5e6fb145df2c64d19cb3eb79146fe116f1544edc7dc0513c8cc09c823f04d508', '2026-01-05 12:59:59.427458-04', '20251217034817_init', NULL, NULL, '2026-01-05 12:59:59.336443-04', 1);
INSERT INTO public._prisma_migrations VALUES ('21dfb7c1-41f0-4ff8-8d83-df722e04ae56', '4e39703bd29f5a72b6a796cd960fc48ea7b89d547b13bab56a4dead1c3e4e6c9', '2026-01-05 12:59:59.436577-04', '20251217043051_add_critical_indexes', NULL, NULL, '2026-01-05 12:59:59.427783-04', 1);
INSERT INTO public._prisma_migrations VALUES ('609d8c91-f60f-4efe-b485-09e27e927d70', '122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec', '2026-01-05 12:59:59.437496-04', '20251217043130_add_check_constraints', NULL, NULL, '2026-01-05 12:59:59.436835-04', 1);
INSERT INTO public._prisma_migrations VALUES ('ceabfa45-82b0-4d9a-bab3-39dfe1f7e671', '6567af0250c3ea10c86cb8205dc7900cbb062eff137b348944c85dd63310aa11', '2026-01-05 12:59:59.441321-04', '20251217043500_add_check_constraints', NULL, NULL, '2026-01-05 12:59:59.437734-04', 1);
INSERT INTO public._prisma_migrations VALUES ('72a139ff-ecf4-4e2e-85b7-226936eef08c', '98158537f06519ff8f900f58982b66e6adaf1c8c20ceda6a4096537264d66db6', '2026-01-05 12:59:59.455299-04', '20251217144910_add_fase1_complete_changes', NULL, NULL, '2026-01-05 12:59:59.441558-04', 1);
INSERT INTO public._prisma_migrations VALUES ('9a4b3fd0-8b1d-41ae-a1fc-830628acbde0', '122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec', '2026-01-05 12:59:59.456754-04', '20251217144923_add_fase1_complete_changes', NULL, NULL, '2026-01-05 12:59:59.455583-04', 1);
INSERT INTO public._prisma_migrations VALUES ('e2cf8fc9-bee7-4427-83f7-7e6c1b68f30d', '9777516179929487d7ad363cee9669731b3f7a252349bf010b5879f2d8688de9', '2026-01-05 12:59:59.461347-04', '20251217214510_add_dolencia_recovery_fields', NULL, NULL, '2026-01-05 12:59:59.457136-04', 1);
INSERT INTO public._prisma_migrations VALUES ('ef1b9c61-247c-492b-baf8-f12c2901f044', '3a02bff23ccb4947c7228bbea893905b150744fb5da56567bd1b7f6bc49096cb', '2026-01-05 13:00:08.252773-04', '20260105170008_add_asistencia_to_test_fisico', NULL, NULL, '2026-01-05 13:00:08.24323-04', 1);


--
-- Data for Name: alertas_sistema; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: asignaciones_atleta_microciclo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.asignaciones_atleta_microciclo VALUES (1, 1, 1, 2, '2026-01-05 13:06:46.42', true, NULL, '2026-01-05 13:06:46.42', '2026-01-05 13:06:46.42');
INSERT INTO public.asignaciones_atleta_microciclo VALUES (2, 1, 2, 2, '2026-01-05 13:06:46.42', true, NULL, '2026-01-05 13:06:46.42', '2026-01-05 13:06:46.42');


--
-- Data for Name: atletas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.atletas VALUES (1, 4, 'Cochabamba', 'Club ADDJC', 'Senior', '2000-05-15', 24, NULL, NULL, 1, 'MENOS_73K', NULL, NULL, '2026-01-05 13:05:17.655', '2026-01-05 13:05:17.655');


--
-- Data for Name: auditorias_acceso; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: baremos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.baremos VALUES (1, 'VOLUMEN', 1, 0.00, 25.00, 90, 108, NULL, NULL, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (2, 'VOLUMEN', 2, 26.00, 40.00, 109, 126, NULL, NULL, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (3, 'VOLUMEN', 3, 41.00, 55.00, 127, 144, NULL, NULL, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (4, 'VOLUMEN', 4, 56.00, 70.00, 145, 163, NULL, NULL, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (5, 'VOLUMEN', 5, 71.00, 85.00, 164, 180, NULL, NULL, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (6, 'VOLUMEN', 6, 86.00, 100.00, 180, 208, NULL, NULL, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (7, 'INTENSIDAD', 1, 100.00, 100.00, NULL, NULL, 209, 220, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (8, 'INTENSIDAD', 2, 85.00, 85.00, NULL, NULL, 190, 209, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (9, 'INTENSIDAD', 3, 70.00, 70.00, NULL, NULL, 170, 189, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (10, 'INTENSIDAD', 4, 55.00, 55.00, NULL, NULL, 150, 169, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (11, 'INTENSIDAD', 5, 40.00, 40.00, NULL, NULL, 130, 149, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');
INSERT INTO public.baremos VALUES (12, 'INTENSIDAD', 6, 25.00, 25.00, NULL, NULL, 110, 129, '2026-01-05 13:04:48.707', '2026-01-05 13:04:48.707');


--
-- Data for Name: catalogo_ejercicios; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: dolencias; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: entrenadores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.entrenadores VALUES (1, 3, 'Cochabamba', 'Judo', '2026-01-05 13:05:10.863', '2026-01-05 13:05:10.863');


--
-- Data for Name: macrociclos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.macrociclos VALUES (1, 'Macrociclo 2025', '2025', 'ADDJC Senior', 'Senior', 'Preparacion fisica general', 'Mejora de resistencia', 'Competencia regional', '2025-01-01', '2025-12-31', 'EN_CURSO', 4, 28, 100.00, 2, '2026-01-05 13:05:37.957', '2026-01-05 13:05:37.957');


--
-- Data for Name: mesociclos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mesociclos VALUES (1, 1, 'Preparacion General', 1, 'PREPARACION_GENERAL', '2025-01-01', '2025-02-28', 'Desarrollar base aerobica', 'Perfeccionar tecnicas basicas', 'Trabajo de ne-waza', 4, '2026-01-05 13:05:52.584', '2026-01-05 13:05:52.584');


--
-- Data for Name: microciclos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.microciclos VALUES (1, 1, 1, 1, '2026-01-06', '2026-01-12', 'CARGA', 100.00, 70.00, 'Semana de adaptacion', NULL, 'COMITE_TECNICO', NULL, NULL, NULL, NULL, '2026-01-05 13:06:07.252', '2026-01-05 13:06:07.252', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.microciclos VALUES (2, 1, 2, 2, '2026-01-13', '2026-01-19', 'CARGA', 110.00, 75.00, 'Incremento de carga', NULL, 'COMITE_TECNICO', NULL, NULL, NULL, NULL, '2026-01-05 13:06:07.252', '2026-01-05 13:06:07.252', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: nomenclatura; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.nomenclatura VALUES (1, 'F', 'Fuerza', 'CUALIDAD_FISICA', 'Fuerza básica - Desarrollo de fuerza máxima', 70.00, 'Anaeróbico alactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (2, 'FRes', 'Fuerza resistencia', 'CUALIDAD_FISICA', 'Resistencia a la fuerza - Capacidad de mantener esfuerzos de fuerza prolongados', 80.00, 'Anaeróbico lactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (3, 'F especial', 'Fuerza especial', 'CUALIDAD_FISICA', 'Fuerza específica del judo - Alta intensidad con técnicas específicas', 85.00, 'Anaeróbico lactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (4, 'Res', 'Resistencia', 'CUALIDAD_FISICA', 'Resistencia básica - Capacidad aeróbica general', 75.00, 'Aeróbico', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (5, 'ResF', 'Resistencia a la fuerza', 'CUALIDAD_FISICA', 'Resistencia combinada con fuerza - Trabajo de fuerza prolongado', 80.00, 'Anaeróbico lactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (6, 'Res Vel', 'Resistencia a la velocidad', 'CUALIDAD_FISICA', 'Capacidad de mantener velocidad en esfuerzos prolongados', 95.00, 'Anaeróbico lactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (7, 'Vel', 'Velocidad', 'CUALIDAD_FISICA', 'Velocidad máxima - Esfuerzos explosivos de corta duración', 100.00, 'Anaeróbico alactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (8, 'Vel reac', 'Velocidad de reacción', 'CUALIDAD_FISICA', 'Velocidad de respuesta a estímulos - Tiempo de reacción', 100.00, 'Anaeróbico alactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (9, 'Vel especial', 'Velocidad especial', 'CUALIDAD_FISICA', 'Velocidad específica del judo - Ataques explosivos', 95.00, 'Anaeróbico alactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (10, 'Fl', 'Flexibilidad', 'CUALIDAD_FISICA', 'Amplitud de movimiento - Elasticidad muscular y articular', NULL, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (11, 'Calento. X''', 'Calentamiento', 'CONTENIDO', 'Ejercicios físicos globales, específicos y físico-técnicos (I máx = umbral anaeróbico) - Movilización general (calistenia)', NULL, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (12, 'CROSS X''', 'Carrera continua', 'CONTENIDO', 'Carrera continua en el umbral anaeróbico como media (I máx = umbral anaeróbico)', 75.00, 'Aeróbico', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (13, 'TATAMI X''', 'Trabajos técnicos en tatami', 'CONTENIDO', 'Trabajos de aprendizaje y perfeccionamiento técnico (I máx = umbral anaeróbico)', NULL, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (14, 'VelGral', 'Velocidad general', 'CONTENIDO', '50 mts lisos - Velocidad máxima en carrera', 100.00, 'Anaeróbico alactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (15, 'ResVelGral', 'Res. a velocidad general', 'CONTENIDO', '200 mts lisos - Resistencia a la velocidad', 95.00, 'Anaeróbico lactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (16, 'Res Gral', 'Resistencia general', 'CONTENIDO', '1500 mts lisos - Resistencia aeróbica general', 75.00, 'Aeróbico-anaeróbico lactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (17, 'ResFGral', 'Resistencia a la fuerza general', 'CONTENIDO', 'Ejercicios de fuerza resistencia - Barra, paralelas, etc.', 80.00, 'Anaeróbico lactácido', '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (18, 'Vel-F-Fl', 'Velocidad-Fuerza-Flexibilidad', 'ZONA_ESFUERZO', 'Res básica 1 - Combinación de velocidad, fuerza y flexibilidad', 75.00, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (19, 'Res-ResF', 'Resistencia-Resistencia a la fuerza', 'ZONA_ESFUERZO', 'Res básica 2 - Combinación de resistencia aeróbica y fuerza resistencia', 75.00, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (20, 'ResVel-F', 'Resistencia velocidad-Fuerza', 'ZONA_ESFUERZO', 'VO2 máx 1 - Combinación de resistencia a la velocidad y fuerza', 80.00, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (21, 'Vel reac-F', 'Velocidad reacción-Fuerza', 'ZONA_ESFUERZO', 'Tol lact 1 - Velocidad de reacción con componente de fuerza', 85.00, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (22, 'ResVel-FRes', 'Resistencia velocidad-Fuerza resistencia', 'ZONA_ESFUERZO', 'VO2 máx 2 - Resistencia a velocidad alta con fuerza resistencia', 80.00, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (23, 'F-Vel especial', 'Fuerza-Velocidad especial', 'ZONA_ESFUERZO', 'Pot anae máx - Potencia anaeróbica máxima, fuerza explosiva', 95.00, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');
INSERT INTO public.nomenclatura VALUES (24, 'ResVel', 'Resistencia velocidad', 'ZONA_ESFUERZO', 'Res especial - Resistencia específica a la velocidad', 95.00, NULL, '2026-01-05 13:04:48.71', '2026-01-05 13:04:48.71');


--
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: recomendaciones; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: registros_post_entrenamiento; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.registros_post_entrenamiento VALUES (1, 1, 8, 1, '2026-01-05 17:24:00.947', true, NULL, 100.00, 80.00, 90, 7, 8, 7.5, 8, NULL, '2026-01-05 17:24:00.947', '2026-01-05 17:24:00.947');
INSERT INTO public.registros_post_entrenamiento VALUES (2, 1, 10, 1, '2026-01-05 17:24:01.577', true, NULL, 80.00, 50.00, 60, 4, 9, 8.0, 9, NULL, '2026-01-05 17:24:01.577', '2026-01-05 17:24:01.577');
INSERT INTO public.registros_post_entrenamiento VALUES (4, 1, 16, 1, '2026-01-05 17:37:29.006', true, NULL, 0.00, 0.00, 1, 1, 1, NULL, 1, 'Gano medalla de oro', '2026-01-05 17:37:29.006', '2026-01-05 17:37:29.006');


--
-- Data for Name: reset_passwords; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: sesiones; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sesiones VALUES (8, 1, '2026-01-06', 'LUNES', 1, 'ENTRENAMIENTO', 'COMPLETO', 'INICIAL', NULL, 'COMITE_TECNICO', 120, 80, 70, NULL, '80/70', NULL, NULL, NULL, 'Fuerza base', 'O-soto-gari', 'Trabajo pie', NULL, NULL, NULL, NULL, NULL, '2026-01-05 13:06:34.025', '2026-01-05 13:06:34.025', NULL);
INSERT INTO public.sesiones VALUES (9, 1, '2026-01-07', 'MARTES', 2, 'ENTRENAMIENTO', 'COMPLETO', 'INICIAL', NULL, 'COMITE_TECNICO', 120, 85, 75, NULL, '85/75', NULL, NULL, NULL, 'Resistencia', 'Uchi-mata', 'Combinaciones', NULL, NULL, NULL, NULL, NULL, '2026-01-05 13:06:34.025', '2026-01-05 13:06:34.025', NULL);
INSERT INTO public.sesiones VALUES (10, 1, '2026-01-08', 'MIERCOLES', 3, 'RECUPERACION', 'COMPLETO', 'INICIAL', NULL, 'COMITE_TECNICO', 60, 40, 50, NULL, '40/50', NULL, NULL, NULL, 'Flexibilidad', 'Ukemi', 'Descanso activo', NULL, NULL, NULL, NULL, NULL, '2026-01-05 13:06:34.025', '2026-01-05 13:06:34.025', NULL);
INSERT INTO public.sesiones VALUES (11, 1, '2026-01-09', 'JUEVES', 4, 'ENTRENAMIENTO', 'COMPLETO', 'INICIAL', NULL, 'COMITE_TECNICO', 100, 75, 70, NULL, '75/70', NULL, NULL, NULL, 'Fuerza explosiva', 'Seoi-nage', 'Randori', NULL, NULL, NULL, NULL, NULL, '2026-01-05 13:06:34.025', '2026-01-05 13:06:34.025', NULL);
INSERT INTO public.sesiones VALUES (12, 1, '2026-01-10', 'VIERNES', 5, 'TEST', 'COMPLETO', 'INICIAL', NULL, 'COMITE_TECNICO', 90, 60, 80, NULL, '60/80', NULL, NULL, NULL, 'Tests fisicos', 'Evaluacion', 'Pruebas', NULL, NULL, NULL, NULL, NULL, '2026-01-05 13:06:34.025', '2026-01-05 13:06:34.025', NULL);
INSERT INTO public.sesiones VALUES (13, 1, '2026-01-11', 'SABADO', 6, 'ENTRENAMIENTO', 'COMPLETO', 'INICIAL', NULL, 'COMITE_TECNICO', 90, 70, 65, NULL, '70/65', NULL, NULL, NULL, 'Circuito', 'Ne-waza', 'Suelo', NULL, NULL, NULL, NULL, NULL, '2026-01-05 13:06:34.025', '2026-01-05 13:06:34.025', NULL);
INSERT INTO public.sesiones VALUES (16, 1, '2026-01-11', 'SABADO', 7, 'COMPETENCIA', 'COMPLETO', 'INICIAL', NULL, 'COMITE_TECNICO', 240, 100, 100, NULL, '100/100', NULL, NULL, NULL, 'Torneo', 'Competencia', 'Torneo regional', NULL, NULL, NULL, NULL, NULL, '2026-01-05 17:36:34.779', '2026-01-05 17:36:34.779', NULL);


--
-- Data for Name: tests_fisicos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tests_fisicos VALUES (1, 1, 1, 12, '2026-01-10', 1, 80.00, NULL, NULL, NULL, 120.00, NULL, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-05 17:23:26.456', '2026-01-05 17:23:26.456', true, NULL);


--
-- Data for Name: tolerancias_peso; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuarios VALUES (1, '1000001', 'Administrador Sistema', 'admin@addjc.com', '$2b$10$YHoXbqdiyh3z2dKLFM5HZ.IgBw9d6GrqxKPYSbCFnVLExadsAdchu', 'ADMINISTRADOR', true, '2026-01-05 13:05:01.253', NULL, '2026-01-05 13:05:01.253', '2026-01-05 13:05:01.253');
INSERT INTO public.usuarios VALUES (2, '2000002', 'Comite Tecnico', 'comite@addjc.com', '$2b$10$dqnSOMso6KA.iCtipphEi.Dkdqcx4E8jMpYGiQSjOB8v8hayfTPnK', 'COMITE_TECNICO', true, '2026-01-05 13:05:01.253', NULL, '2026-01-05 13:05:01.253', '2026-01-05 13:05:01.253');
INSERT INTO public.usuarios VALUES (3, '3000003', 'Entrenador Principal', 'entrenador@addjc.com', '$2b$10$uQtYPEoLQLxm5WlCfL/mV.MEJo08zoUdoP6jJwi2pRc6ZqYJzqnTy', 'ENTRENADOR', true, '2026-01-05 13:05:01.253', NULL, '2026-01-05 13:05:01.253', '2026-01-05 13:05:01.253');
INSERT INTO public.usuarios VALUES (4, '4000004', 'Atleta Prueba', 'atleta@addjc.com', '$2b$10$fOYtM//Mr9v0z.h7KC9RkuCo9zApDKi9o0yTTjIHRQhe3W8.tihoK', 'ATLETA', true, '2026-01-05 13:05:01.253', NULL, '2026-01-05 13:05:01.253', '2026-01-05 13:05:01.253');


--
-- Data for Name: zonas_esfuerzo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.zonas_esfuerzo VALUES (1, 'Fmáx', 'Fuerza máxima', 'FUERZA', 70.00, 'Desarrollo de fuerza máxima - Cargas >85% 1RM, series de 1-5 reps, pausas 3-5 min', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (2, 'F básica', 'Fuerza básica', 'FUERZA', 70.00, 'Fuerza básica general - Cargas 70-85% 1RM', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (3, 'F especial', 'Fuerza especial', 'FUERZA', 85.00, 'Fuerza específica del judo - Ejercicios técnicos con alta carga', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (4, '(F-ResF)máx', 'Fuerza-Resistencia a la fuerza máxima', 'FUERZA', 75.00, 'Combinación de fuerza máxima y resistencia a la fuerza', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (5, 'Res básica 0', 'Resistencia básica nivel 0', 'RESISTENCIA', 60.00, 'Resistencia aeróbica muy básica - Recuperación activa', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (6, 'Res básica 1', 'Resistencia básica nivel 1', 'RESISTENCIA', 75.00, 'Resistencia aeróbica básica - Trabajo continuo moderado', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (7, 'Res básica 2', 'Resistencia básica nivel 2', 'RESISTENCIA', 75.00, 'Resistencia aeróbica avanzada - Umbral anaeróbico', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (8, 'Res especial', 'Resistencia especial', 'RESISTENCIA', 85.00, 'Resistencia específica del judo - Alta intensidad específica', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (9, 'Res Esp 1', 'Resistencia especial tipo 1', 'RESISTENCIA', 85.00, 'Resistencia especial tipo 1 - Trabajo interválico específico', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (10, 'Res Esp 5''', 'Resistencia especial 5 minutos', 'RESISTENCIA', 85.00, 'Resistencia especial con esfuerzos de 5 minutos', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (11, '(ResF-Paero)máx', 'Resistencia fuerza-Potencia aeróbica máxima', 'RESISTENCIA', 85.00, 'Combinación de resistencia a la fuerza y potencia aeróbica', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (12, '(ResF-Vel)máx', 'Resistencia fuerza-Velocidad máxima', 'RESISTENCIA', 90.00, 'Combinación de resistencia a la fuerza y velocidad máxima', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (13, 'Res-F-Fl', 'Resistencia-Fuerza-Flexibilidad', 'RESISTENCIA', 75.00, 'Trabajo combinado de resistencia, fuerza y flexibilidad', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (14, 'VO2 máx 0', 'VO2 máximo nivel 0', 'VO2MAX', 70.00, 'Trabajo de VO2max nivel básico', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (15, 'VO2 máx 1', 'VO2 máximo nivel 1', 'VO2MAX', 80.00, 'Trabajo de VO2max al 80% - Mejora capacidad aeróbica máxima', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (16, 'VO2máx 1', 'VO2máx nivel 1', 'VO2MAX', 80.00, 'VO2máx nivel 1 (sin espacio) - Equivalente a VO2 máx 1', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (17, 'VO2 máx 2', 'VO2 máximo nivel 2', 'VO2MAX', 80.00, 'Trabajo de VO2max nivel 2 - Intervalos de alta intensidad', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (18, 'VO2máx 2', 'VO2máx nivel 2', 'VO2MAX', 80.00, 'VO2máx nivel 2 (sin espacio) - Equivalente a VO2 máx 2', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (19, 'Tol lact 1', 'Tolerancia lactato tipo 1', 'TOLERANCIA_LACTATO', 85.00, 'Tolerancia al lactato nivel 1 - Trabajo por encima del umbral anaeróbico', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (20, 'Tol lact 2', 'Tolerancia lactato tipo 2', 'TOLERANCIA_LACTATO', 85.00, 'Tolerancia al lactato nivel 2 - Alta acumulación de lactato', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (21, 'Pot anae máx', 'Potencia anaeróbica máxima', 'POTENCIA', 95.00, 'Potencia anaeróbica máxima - Esfuerzos explosivos de 10-30 segundos', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (22, 'Vel Esp 1', 'Velocidad especial tipo 1', 'VELOCIDAD', 100.00, 'Velocidad especial del judo - Ataques explosivos máximos', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (23, 'Res Vel Esp 1''', 'Resistencia velocidad especial 1 minuto', 'VELOCIDAD', 95.00, 'Resistencia a la velocidad específica con esfuerzos de 1 minuto', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (24, 'ResVel máx', 'Resistencia a la velocidad máxima', 'VELOCIDAD', 95.00, 'Resistencia a la velocidad al máximo - Repeticiones de alta velocidad', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (25, 'ResVel-FRes', 'Resistencia velocidad-Fuerza resistencia', 'VELOCIDAD', 85.00, 'Combinación de resistencia a la velocidad y fuerza resistencia', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (26, 'Descanso', 'Descanso completo', 'RECUPERACION', NULL, 'Descanso pasivo - Recuperación completa sin actividad física', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (27, 'Descanso act', 'Descanso activo', 'RECUPERACION', 40.00, 'Recuperación activa - Actividades de muy baja intensidad (masaje, sauna, vídeo, juegos)', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (28, 'Relajación', 'Relajación', 'RECUPERACION', NULL, 'Técnicas de relajación - Estiramientos, respiración, yoga', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (29, 'Básica', 'Etapa básica', 'ETAPA', NULL, 'Etapa de preparación básica/general', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (30, 'Específica', 'Etapa específica', 'ETAPA', NULL, 'Etapa de preparación específica', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');
INSERT INTO public.zonas_esfuerzo VALUES (31, 'Especial', 'Etapa especial', 'ETAPA', NULL, 'Etapa especial/pre-competitiva', '2026-01-05 13:04:48.712', '2026-01-05 13:04:48.712');


--
-- Name: alertas_sistema_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.alertas_sistema_id_seq', 1, false);


--
-- Name: asignaciones_atleta_microciclo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asignaciones_atleta_microciclo_id_seq', 2, true);


--
-- Name: atletas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.atletas_id_seq', 1, true);


--
-- Name: auditorias_acceso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auditorias_acceso_id_seq', 1, false);


--
-- Name: baremos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.baremos_id_seq', 12, true);


--
-- Name: catalogo_ejercicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.catalogo_ejercicios_id_seq', 1, false);


--
-- Name: dolencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dolencias_id_seq', 1, false);


--
-- Name: entrenadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.entrenadores_id_seq', 1, true);


--
-- Name: macrociclos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.macrociclos_id_seq', 1, true);


--
-- Name: mesociclos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mesociclos_id_seq', 1, true);


--
-- Name: microciclos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.microciclos_id_seq', 2, true);


--
-- Name: nomenclatura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nomenclatura_id_seq', 24, true);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notificaciones_id_seq', 1, false);


--
-- Name: recomendaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recomendaciones_id_seq', 1, false);


--
-- Name: registros_post_entrenamiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.registros_post_entrenamiento_id_seq', 4, true);


--
-- Name: reset_passwords_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reset_passwords_id_seq', 1, false);


--
-- Name: sesiones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sesiones_id_seq', 16, true);


--
-- Name: tests_fisicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tests_fisicos_id_seq', 1, true);


--
-- Name: tolerancias_peso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tolerancias_peso_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 4, true);


--
-- Name: zonas_esfuerzo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.zonas_esfuerzo_id_seq', 31, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: alertas_sistema alertas_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alertas_sistema
    ADD CONSTRAINT alertas_sistema_pkey PRIMARY KEY (id);


--
-- Name: asignaciones_atleta_microciclo asignaciones_atleta_microciclo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignaciones_atleta_microciclo
    ADD CONSTRAINT asignaciones_atleta_microciclo_pkey PRIMARY KEY (id);


--
-- Name: atletas atletas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atletas
    ADD CONSTRAINT atletas_pkey PRIMARY KEY (id);


--
-- Name: auditorias_acceso auditorias_acceso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_acceso
    ADD CONSTRAINT auditorias_acceso_pkey PRIMARY KEY (id);


--
-- Name: baremos baremos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baremos
    ADD CONSTRAINT baremos_pkey PRIMARY KEY (id);


--
-- Name: catalogo_ejercicios catalogo_ejercicios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalogo_ejercicios
    ADD CONSTRAINT catalogo_ejercicios_pkey PRIMARY KEY (id);


--
-- Name: dolencias dolencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dolencias
    ADD CONSTRAINT dolencias_pkey PRIMARY KEY (id);


--
-- Name: entrenadores entrenadores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrenadores
    ADD CONSTRAINT entrenadores_pkey PRIMARY KEY (id);


--
-- Name: macrociclos macrociclos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.macrociclos
    ADD CONSTRAINT macrociclos_pkey PRIMARY KEY (id);


--
-- Name: mesociclos mesociclos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesociclos
    ADD CONSTRAINT mesociclos_pkey PRIMARY KEY (id);


--
-- Name: microciclos microciclos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microciclos
    ADD CONSTRAINT microciclos_pkey PRIMARY KEY (id);


--
-- Name: nomenclatura nomenclatura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nomenclatura
    ADD CONSTRAINT nomenclatura_pkey PRIMARY KEY (id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: recomendaciones recomendaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT recomendaciones_pkey PRIMARY KEY (id);


--
-- Name: registros_post_entrenamiento registros_post_entrenamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_post_entrenamiento
    ADD CONSTRAINT registros_post_entrenamiento_pkey PRIMARY KEY (id);


--
-- Name: reset_passwords reset_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reset_passwords
    ADD CONSTRAINT reset_passwords_pkey PRIMARY KEY (id);


--
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id);


--
-- Name: tests_fisicos tests_fisicos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests_fisicos
    ADD CONSTRAINT tests_fisicos_pkey PRIMARY KEY (id);


--
-- Name: tolerancias_peso tolerancias_peso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tolerancias_peso
    ADD CONSTRAINT tolerancias_peso_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: zonas_esfuerzo zonas_esfuerzo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zonas_esfuerzo
    ADD CONSTRAINT zonas_esfuerzo_pkey PRIMARY KEY (id);


--
-- Name: alertas_sistema_atletaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "alertas_sistema_atletaId_idx" ON public.alertas_sistema USING btree ("atletaId");


--
-- Name: alertas_sistema_destinatarioId_leida_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "alertas_sistema_destinatarioId_leida_idx" ON public.alertas_sistema USING btree ("destinatarioId", leida);


--
-- Name: alertas_sistema_tipo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alertas_sistema_tipo_idx ON public.alertas_sistema USING btree (tipo);


--
-- Name: asignaciones_atleta_microciclo_asignadoPor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "asignaciones_atleta_microciclo_asignadoPor_idx" ON public.asignaciones_atleta_microciclo USING btree ("asignadoPor");


--
-- Name: asignaciones_atleta_microciclo_atletaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "asignaciones_atleta_microciclo_atletaId_idx" ON public.asignaciones_atleta_microciclo USING btree ("atletaId");


--
-- Name: asignaciones_atleta_microciclo_atletaId_microcicloId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "asignaciones_atleta_microciclo_atletaId_microcicloId_key" ON public.asignaciones_atleta_microciclo USING btree ("atletaId", "microcicloId");


--
-- Name: asignaciones_atleta_microciclo_microcicloId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "asignaciones_atleta_microciclo_microcicloId_idx" ON public.asignaciones_atleta_microciclo USING btree ("microcicloId");


--
-- Name: atletas_categoriaPeso_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "atletas_categoriaPeso_idx" ON public.atletas USING btree ("categoriaPeso");


--
-- Name: atletas_categoria_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX atletas_categoria_idx ON public.atletas USING btree (categoria);


--
-- Name: atletas_club_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX atletas_club_idx ON public.atletas USING btree (club);


--
-- Name: atletas_entrenadorAsignadoId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "atletas_entrenadorAsignadoId_idx" ON public.atletas USING btree ("entrenadorAsignadoId");


--
-- Name: atletas_usuarioId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "atletas_usuarioId_idx" ON public.atletas USING btree ("usuarioId");


--
-- Name: atletas_usuarioId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "atletas_usuarioId_key" ON public.atletas USING btree ("usuarioId");


--
-- Name: auditorias_acceso_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "auditorias_acceso_createdAt_idx" ON public.auditorias_acceso USING btree ("createdAt");


--
-- Name: auditorias_acceso_usuarioId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "auditorias_acceso_usuarioId_idx" ON public.auditorias_acceso USING btree ("usuarioId");


--
-- Name: baremos_nivel_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX baremos_nivel_idx ON public.baremos USING btree (nivel);


--
-- Name: baremos_tipo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX baremos_tipo_idx ON public.baremos USING btree (tipo);


--
-- Name: baremos_tipo_nivel_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX baremos_tipo_nivel_key ON public.baremos USING btree (tipo, nivel);


--
-- Name: catalogo_ejercicios_subtipo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalogo_ejercicios_subtipo_idx ON public.catalogo_ejercicios USING btree (subtipo);


--
-- Name: catalogo_ejercicios_tipo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX catalogo_ejercicios_tipo_idx ON public.catalogo_ejercicios USING btree (tipo);


--
-- Name: dolencias_recuperadoPor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dolencias_recuperadoPor_idx" ON public.dolencias USING btree ("recuperadoPor");


--
-- Name: dolencias_recuperado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dolencias_recuperado_idx ON public.dolencias USING btree (recuperado);


--
-- Name: dolencias_registroPostEntrenamientoId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dolencias_registroPostEntrenamientoId_idx" ON public.dolencias USING btree ("registroPostEntrenamientoId");


--
-- Name: entrenadores_usuarioId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "entrenadores_usuarioId_idx" ON public.entrenadores USING btree ("usuarioId");


--
-- Name: entrenadores_usuarioId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "entrenadores_usuarioId_key" ON public.entrenadores USING btree ("usuarioId");


--
-- Name: macrociclos_creadoPor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "macrociclos_creadoPor_idx" ON public.macrociclos USING btree ("creadoPor");


--
-- Name: macrociclos_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX macrociclos_estado_idx ON public.macrociclos USING btree (estado);


--
-- Name: mesociclos_macrocicloId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "mesociclos_macrocicloId_idx" ON public.mesociclos USING btree ("macrocicloId");


--
-- Name: microciclos_fechaInicio_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "microciclos_fechaInicio_idx" ON public.microciclos USING btree ("fechaInicio");


--
-- Name: microciclos_mesocicloId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "microciclos_mesocicloId_idx" ON public.microciclos USING btree ("mesocicloId");


--
-- Name: nomenclatura_categoria_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX nomenclatura_categoria_idx ON public.nomenclatura USING btree (categoria);


--
-- Name: nomenclatura_codigo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX nomenclatura_codigo_idx ON public.nomenclatura USING btree (codigo);


--
-- Name: nomenclatura_codigo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX nomenclatura_codigo_key ON public.nomenclatura USING btree (codigo);


--
-- Name: notificaciones_destinatarioId_leida_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notificaciones_destinatarioId_leida_idx" ON public.notificaciones USING btree ("destinatarioId", leida);


--
-- Name: notificaciones_recomendacionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notificaciones_recomendacionId_idx" ON public.notificaciones USING btree ("recomendacionId");


--
-- Name: recomendaciones_aplicadoPor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recomendaciones_aplicadoPor_idx" ON public.recomendaciones USING btree ("aplicadoPor");


--
-- Name: recomendaciones_atletaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recomendaciones_atletaId_idx" ON public.recomendaciones USING btree ("atletaId");


--
-- Name: recomendaciones_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recomendaciones_estado_idx ON public.recomendaciones USING btree (estado);


--
-- Name: recomendaciones_microcicloAfectadoId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recomendaciones_microcicloAfectadoId_idx" ON public.recomendaciones USING btree ("microcicloAfectadoId");


--
-- Name: recomendaciones_prioridad_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recomendaciones_prioridad_idx ON public.recomendaciones USING btree (prioridad);


--
-- Name: recomendaciones_registroPostEntrenamientoId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recomendaciones_registroPostEntrenamientoId_idx" ON public.recomendaciones USING btree ("registroPostEntrenamientoId");


--
-- Name: recomendaciones_revisadoPor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recomendaciones_revisadoPor_idx" ON public.recomendaciones USING btree ("revisadoPor");


--
-- Name: recomendaciones_sesionGeneradaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recomendaciones_sesionGeneradaId_idx" ON public.recomendaciones USING btree ("sesionGeneradaId");


--
-- Name: recomendaciones_testFisicoId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "recomendaciones_testFisicoId_idx" ON public.recomendaciones USING btree ("testFisicoId");


--
-- Name: registros_post_entrenamiento_atletaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "registros_post_entrenamiento_atletaId_idx" ON public.registros_post_entrenamiento USING btree ("atletaId");


--
-- Name: registros_post_entrenamiento_entrenadorRegistroId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "registros_post_entrenamiento_entrenadorRegistroId_idx" ON public.registros_post_entrenamiento USING btree ("entrenadorRegistroId");


--
-- Name: registros_post_entrenamiento_fechaRegistro_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "registros_post_entrenamiento_fechaRegistro_idx" ON public.registros_post_entrenamiento USING btree ("fechaRegistro");


--
-- Name: registros_post_entrenamiento_sesionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "registros_post_entrenamiento_sesionId_idx" ON public.registros_post_entrenamiento USING btree ("sesionId");


--
-- Name: reset_passwords_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reset_passwords_token_idx ON public.reset_passwords USING btree (token);


--
-- Name: reset_passwords_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX reset_passwords_token_key ON public.reset_passwords USING btree (token);


--
-- Name: reset_passwords_usuarioId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reset_passwords_usuarioId_idx" ON public.reset_passwords USING btree ("usuarioId");


--
-- Name: sesiones_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sesiones_fecha_idx ON public.sesiones USING btree (fecha);


--
-- Name: sesiones_microcicloId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sesiones_microcicloId_idx" ON public.sesiones USING btree ("microcicloId");


--
-- Name: sesiones_sesionBaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sesiones_sesionBaseId_idx" ON public.sesiones USING btree ("sesionBaseId");


--
-- Name: tests_fisicos_atletaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_fisicos_atletaId_idx" ON public.tests_fisicos USING btree ("atletaId");


--
-- Name: tests_fisicos_entrenadorRegistroId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_fisicos_entrenadorRegistroId_idx" ON public.tests_fisicos USING btree ("entrenadorRegistroId");


--
-- Name: tests_fisicos_fechaTest_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_fisicos_fechaTest_idx" ON public.tests_fisicos USING btree ("fechaTest");


--
-- Name: tests_fisicos_microcicloId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_fisicos_microcicloId_idx" ON public.tests_fisicos USING btree ("microcicloId");


--
-- Name: tests_fisicos_sesionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_fisicos_sesionId_idx" ON public.tests_fisicos USING btree ("sesionId");


--
-- Name: tolerancias_peso_categoriaPeso_periodo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tolerancias_peso_categoriaPeso_periodo_key" ON public.tolerancias_peso USING btree ("categoriaPeso", periodo);


--
-- Name: usuarios_ci_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX usuarios_ci_idx ON public.usuarios USING btree (ci);


--
-- Name: usuarios_ci_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_ci_key ON public.usuarios USING btree (ci);


--
-- Name: usuarios_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX usuarios_email_idx ON public.usuarios USING btree (email);


--
-- Name: usuarios_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email);


--
-- Name: usuarios_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX usuarios_estado_idx ON public.usuarios USING btree (estado);


--
-- Name: usuarios_rol_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX usuarios_rol_idx ON public.usuarios USING btree (rol);


--
-- Name: zonas_esfuerzo_categoria_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX zonas_esfuerzo_categoria_idx ON public.zonas_esfuerzo USING btree (categoria);


--
-- Name: zonas_esfuerzo_codigo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX zonas_esfuerzo_codigo_idx ON public.zonas_esfuerzo USING btree (codigo);


--
-- Name: zonas_esfuerzo_codigo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX zonas_esfuerzo_codigo_key ON public.zonas_esfuerzo USING btree (codigo);


--
-- Name: alertas_sistema alertas_sistema_atletaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alertas_sistema
    ADD CONSTRAINT "alertas_sistema_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES public.atletas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alertas_sistema alertas_sistema_destinatarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alertas_sistema
    ADD CONSTRAINT "alertas_sistema_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_atleta_microciclo asignaciones_atleta_microciclo_asignadoPor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignaciones_atleta_microciclo
    ADD CONSTRAINT "asignaciones_atleta_microciclo_asignadoPor_fkey" FOREIGN KEY ("asignadoPor") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_atleta_microciclo asignaciones_atleta_microciclo_atletaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignaciones_atleta_microciclo
    ADD CONSTRAINT "asignaciones_atleta_microciclo_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES public.atletas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asignaciones_atleta_microciclo asignaciones_atleta_microciclo_microcicloId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignaciones_atleta_microciclo
    ADD CONSTRAINT "asignaciones_atleta_microciclo_microcicloId_fkey" FOREIGN KEY ("microcicloId") REFERENCES public.microciclos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: atletas atletas_entrenadorAsignadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atletas
    ADD CONSTRAINT "atletas_entrenadorAsignadoId_fkey" FOREIGN KEY ("entrenadorAsignadoId") REFERENCES public.entrenadores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: atletas atletas_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atletas
    ADD CONSTRAINT "atletas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auditorias_acceso auditorias_acceso_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_acceso
    ADD CONSTRAINT "auditorias_acceso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dolencias dolencias_recuperadoPor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dolencias
    ADD CONSTRAINT "dolencias_recuperadoPor_fkey" FOREIGN KEY ("recuperadoPor") REFERENCES public.entrenadores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dolencias dolencias_registroPostEntrenamientoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dolencias
    ADD CONSTRAINT "dolencias_registroPostEntrenamientoId_fkey" FOREIGN KEY ("registroPostEntrenamientoId") REFERENCES public.registros_post_entrenamiento(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: entrenadores entrenadores_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entrenadores
    ADD CONSTRAINT "entrenadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: macrociclos macrociclos_creadoPor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.macrociclos
    ADD CONSTRAINT "macrociclos_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mesociclos mesociclos_macrocicloId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesociclos
    ADD CONSTRAINT "mesociclos_macrocicloId_fkey" FOREIGN KEY ("macrocicloId") REFERENCES public.macrociclos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: microciclos microciclos_mesocicloId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microciclos
    ADD CONSTRAINT "microciclos_mesocicloId_fkey" FOREIGN KEY ("mesocicloId") REFERENCES public.mesociclos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notificaciones notificaciones_destinatarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT "notificaciones_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notificaciones notificaciones_recomendacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT "notificaciones_recomendacionId_fkey" FOREIGN KEY ("recomendacionId") REFERENCES public.recomendaciones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recomendaciones recomendaciones_aplicadoPor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT "recomendaciones_aplicadoPor_fkey" FOREIGN KEY ("aplicadoPor") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recomendaciones recomendaciones_atletaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT "recomendaciones_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES public.atletas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recomendaciones recomendaciones_microcicloAfectadoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT "recomendaciones_microcicloAfectadoId_fkey" FOREIGN KEY ("microcicloAfectadoId") REFERENCES public.microciclos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recomendaciones recomendaciones_registroPostEntrenamientoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT "recomendaciones_registroPostEntrenamientoId_fkey" FOREIGN KEY ("registroPostEntrenamientoId") REFERENCES public.registros_post_entrenamiento(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recomendaciones recomendaciones_revisadoPor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT "recomendaciones_revisadoPor_fkey" FOREIGN KEY ("revisadoPor") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recomendaciones recomendaciones_sesionGeneradaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT "recomendaciones_sesionGeneradaId_fkey" FOREIGN KEY ("sesionGeneradaId") REFERENCES public.sesiones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recomendaciones recomendaciones_testFisicoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT "recomendaciones_testFisicoId_fkey" FOREIGN KEY ("testFisicoId") REFERENCES public.tests_fisicos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: registros_post_entrenamiento registros_post_entrenamiento_atletaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_post_entrenamiento
    ADD CONSTRAINT "registros_post_entrenamiento_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES public.atletas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registros_post_entrenamiento registros_post_entrenamiento_entrenadorRegistroId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_post_entrenamiento
    ADD CONSTRAINT "registros_post_entrenamiento_entrenadorRegistroId_fkey" FOREIGN KEY ("entrenadorRegistroId") REFERENCES public.entrenadores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: registros_post_entrenamiento registros_post_entrenamiento_sesionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_post_entrenamiento
    ADD CONSTRAINT "registros_post_entrenamiento_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES public.sesiones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reset_passwords reset_passwords_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reset_passwords
    ADD CONSTRAINT "reset_passwords_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sesiones sesiones_microcicloId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT "sesiones_microcicloId_fkey" FOREIGN KEY ("microcicloId") REFERENCES public.microciclos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sesiones sesiones_sesionBaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT "sesiones_sesionBaseId_fkey" FOREIGN KEY ("sesionBaseId") REFERENCES public.sesiones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tests_fisicos tests_fisicos_atletaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests_fisicos
    ADD CONSTRAINT "tests_fisicos_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES public.atletas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tests_fisicos tests_fisicos_entrenadorRegistroId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests_fisicos
    ADD CONSTRAINT "tests_fisicos_entrenadorRegistroId_fkey" FOREIGN KEY ("entrenadorRegistroId") REFERENCES public.entrenadores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tests_fisicos tests_fisicos_microcicloId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests_fisicos
    ADD CONSTRAINT "tests_fisicos_microcicloId_fkey" FOREIGN KEY ("microcicloId") REFERENCES public.microciclos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tests_fisicos tests_fisicos_sesionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests_fisicos
    ADD CONSTRAINT "tests_fisicos_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES public.sesiones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict SW6zxWIsrLWejn5DubeLO3a33Sf6eirYeV7v4eNJgQOBwptQCzLcxGirNN9Yebw

