// Eventos relacionados con tests fisicos
// Se emiten cuando se crea/actualiza un test para que otros servicios reaccionen

export const TEST_FISICO_EVENTS = {
  CREATED: 'test-fisico.created',
  UPDATED: 'test-fisico.updated',
} as const;

// Payload del evento cuando se crea un test fisico
export interface TestFisicoCreatedPayload {
  testId: bigint;
  atletaId: bigint;
  fechaTest: Date;
  // Datos necesarios para calcular el perfil
  datosTest: {
    pressBanca: number | null;
    tiron: number | null;
    sentadilla: number | null;
    barraFija: number | null;
    paralelas: number | null;
    navettePalier: number | null;
    navetteVO2max: number | null;
  };
}
