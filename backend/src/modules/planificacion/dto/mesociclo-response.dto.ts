import { EtapaMesociclo } from '@prisma/client';

// BigInt se convierte automaticamente a string por BigIntTransformInterceptor
export interface MesocicloResponseDto {
  id: bigint;
  macrocicloId: bigint;
  nombre: string;
  codigoMesociclo: string;
  etapa: EtapaMesociclo;
  fechaInicio: Date;
  fechaFin: Date;
  objetivoFisico: string;
  objetivoTecnico: string;
  objetivoTactico: string;
  createdAt: Date;
  updatedAt: Date;
  macrociclo?: {
    id: bigint;
    nombre: string;
    temporada: string;
  };
}
