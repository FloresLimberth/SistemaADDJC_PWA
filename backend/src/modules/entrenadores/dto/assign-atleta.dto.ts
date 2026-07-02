import { IsString } from 'class-validator';

export class AssignAtletaDto {
  @IsString()
  atletaId!: string; // BigInt convertido a string
}
