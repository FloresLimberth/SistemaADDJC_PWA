// Archivo centralizado de rutas de la aplicacion
// Este archivo evita hardcodear rutas en formularios y componentes
// Cualquier cambio en la estructura de rutas debe reflejarse aqui

// Rutas del Comite Tecnico
export const COMITE_TECNICO_ROUTES = {
  // Dashboard
  dashboard: '/comite-tecnico',

  // Atletas
  atletas: {
    list: '/comite-tecnico/atletas',
    nuevo: '/comite-tecnico/atletas/nuevo',
    detalle: (id: string | number) => `/comite-tecnico/atletas/${id}`,
    editar: (id: string | number) => `/comite-tecnico/atletas/${id}/editar`,
  },

  // Entrenadores
  entrenadores: {
    list: '/comite-tecnico/entrenadores',
    nuevo: '/comite-tecnico/entrenadores/nuevo',
    detalle: (id: string | number) => `/comite-tecnico/entrenadores/${id}`,
    editar: (id: string | number) =>
      `/comite-tecnico/entrenadores/${id}/editar`,
  },

  // Asignaciones (atleta-microciclo)
  asignaciones: {
    list: '/comite-tecnico/asignaciones',
    nuevo: '/comite-tecnico/asignaciones/nuevo',
    detalle: (id: string | number) => `/comite-tecnico/asignaciones/${id}`,
    editar: (id: string | number) =>
      `/comite-tecnico/asignaciones/${id}/editar`,
  },

  // Planificacion
  planificacion: {
    // Macrociclos
    macrociclos: {
      list: '/comite-tecnico/planificacion',
      nuevo: '/comite-tecnico/planificacion/nuevo',
      detalle: (id: string | number) => `/comite-tecnico/planificacion/${id}`,
      editar: (id: string | number) =>
        `/comite-tecnico/planificacion/${id}/editar`,
    },
    // Mesociclos
    mesociclos: {
      list: '/comite-tecnico/planificacion/mesociclos',
      nuevo: '/comite-tecnico/planificacion/mesociclos/nuevo',
      detalle: (id: string | number) =>
        `/comite-tecnico/planificacion/mesociclos/${id}`,
      editar: (id: string | number) =>
        `/comite-tecnico/planificacion/mesociclos/${id}/editar`,
    },
    // Microciclos
    microciclos: {
      list: '/comite-tecnico/planificacion/microciclos',
      nuevo: '/comite-tecnico/planificacion/microciclos/nuevo',
      detalle: (id: string | number) =>
        `/comite-tecnico/planificacion/microciclos/${id}`,
      editar: (id: string | number) =>
        `/comite-tecnico/planificacion/microciclos/${id}/editar`,
    },
  },

  // Sesiones
  sesiones: {
    list: '/comite-tecnico/sesiones',
    nuevo: '/comite-tecnico/sesiones/nuevo',
    detalle: (id: string | number) => `/comite-tecnico/sesiones/${id}`,
    editar: (id: string | number) => `/comite-tecnico/sesiones/${id}/editar`,
  },

  // Algoritmo - Ranking
  ranking: {
    list: '/comite-tecnico/ranking',
    detalle: (atletaId: string | number) =>
      `/comite-tecnico/ranking/${atletaId}`,
  },

  // Algoritmo - Recomendaciones
  recomendaciones: {
    list: '/comite-tecnico/recomendaciones',
    detalle: (id: string | number) =>
      `/comite-tecnico/recomendaciones/${id}`,
  },

  // Algoritmo - Notificaciones
  notificaciones: '/comite-tecnico/notificaciones',

  // Algoritmo - Analisis de rendimiento
  analisis: {
    list: '/comite-tecnico/analisis',
    detalle: (atletaId: string | number) =>
      `/comite-tecnico/analisis/${atletaId}`,
  },

  // Algoritmo - Alertas
  alertas: '/comite-tecnico/alertas',

  // Algoritmo - Catalogo de ejercicios
  catalogoEjercicios: {
    list: '/comite-tecnico/catalogo-ejercicios',
  },
} as const;

// Rutas del Entrenador
export const ENTRENADOR_ROUTES = {
  // Dashboard
  dashboard: '/entrenador',

  // Mis Atletas
  misAtletas: {
    list: '/entrenador/mis-atletas',
    detalle: (atletaId: string | number) =>
      `/entrenador/mis-atletas/${atletaId}`,
  },

  // Planificacion (solo lectura)
  planificacion: {
    // Macrociclos
    macrociclos: {
      list: '/entrenador/planificacion',
      detalle: (id: string | number) => `/entrenador/planificacion/${id}`,
    },
    // Mesociclos
    mesociclos: {
      list: '/entrenador/planificacion/mesociclos',
      detalle: (id: string | number) =>
        `/entrenador/planificacion/mesociclos/${id}`,
    },
    // Microciclos
    microciclos: {
      list: '/entrenador/planificacion/microciclos',
      detalle: (id: string | number) =>
        `/entrenador/planificacion/microciclos/${id}`,
    },
  },

  // Sesiones
  sesiones: {
    list: '/entrenador/sesiones',
    nuevo: '/entrenador/sesiones/nuevo',
    detalle: (id: string | number) => `/entrenador/sesiones/${id}`,
    editar: (id: string | number) => `/entrenador/sesiones/${id}/editar`,
  },

  // Tests Fisicos
  testsFisicos: {
    list: '/entrenador/tests-fisicos',
    nuevo: '/entrenador/tests-fisicos/nuevo',
  },

  // Post-Entrenamiento (registros)
  postEntrenamiento: {
    list: '/entrenador/post-entrenamiento',
    nuevo: '/entrenador/post-entrenamiento/nuevo',
  },

  // Dolencias
  dolencias: '/entrenador/dolencias',

  // Algoritmo - Ranking (sus atletas)
  ranking: '/entrenador/ranking',

  // Algoritmo - Recomendaciones (solo lectura)
  recomendaciones: {
    list: '/entrenador/recomendaciones',
    detalle: (id: string | number) =>
      `/entrenador/recomendaciones/${id}`,
  },

  // Algoritmo - Notificaciones
  notificaciones: '/entrenador/notificaciones',

  // Algoritmo - Analisis de rendimiento (sus atletas)
  analisis: {
    list: '/entrenador/analisis',
    detalle: (atletaId: string | number) =>
      `/entrenador/analisis/${atletaId}`,
  },

  // Algoritmo - Alertas (sus atletas)
  alertas: '/entrenador/alertas',
} as const;

// Rutas del Atleta
export const ATLETA_ROUTES = {
  // Dashboard
  dashboard: '/atleta',

  // Planificacion (solo lectura)
  planificacion: '/atleta/planificacion',

  // Progreso
  progreso: '/atleta/progreso',

  // Tests (solo lectura)
  tests: '/atleta/tests',

  // Dolencias
  dolencias: '/atleta/dolencias',

  // Algoritmo - Ranking (su posicion)
  ranking: '/atleta/ranking',

  // Algoritmo - Notificaciones
  notificaciones: '/atleta/notificaciones',

  // Algoritmo - Analisis de rendimiento (propio)
  analisis: '/atleta/analisis',
} as const;

// Rutas del Administrador
export const ADMIN_ROUTES = {
  // Dashboard
  dashboard: '/admin',

  // Usuarios
  usuarios: {
    list: '/admin/usuarios',
  },

  // Actividad (Activity Logs)
  actividad: '/admin/actividad',
} as const;

// Rutas de autenticacion (publicas)
export const AUTH_ROUTES = {
  login: '/login',
} as const;
