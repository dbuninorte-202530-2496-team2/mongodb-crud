import { IsString, IsNotEmpty, IsInt, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class EdicionDto {
  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @Type(() => Date)
  @IsDate()         
  año!: Date;

  @IsString()
  @IsNotEmpty()
  idioma!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  numCopias!: number;
}