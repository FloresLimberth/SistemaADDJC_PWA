import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { EtapaMesociclo } from '@prisma/client';

export class CreateMesocicloDto {
  @IsString()
  @IsNotEmpty()
  macrocicloId!: string; // BigInt como string desde el cliente

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigoMesociclo!: string;

  @IsEnum(EtapaMesociclo)
  @IsNotEmpty()
  etapa!: EtapaMesociclo;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin!: string;

  @IsString()
  @IsNotEmpty()
  objetivoFisico!: string;

  @IsString()
  @IsNotEmpty()
  objetivoTecnico!: string;

  @IsString()
  @IsNotEmpty()
  objetivoTactico!: string;
}
