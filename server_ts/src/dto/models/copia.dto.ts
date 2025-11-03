import { IsInt, IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCopiasDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @IsNotEmpty()
  numero_copia!: number;
}