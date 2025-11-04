import { IsString, IsNotEmpty, IsInt, Min, IsDate, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEdicionDto {
  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @IsDateString()
  @IsNotEmpty()         
  año!: Date;

  @IsString()
  @IsNotEmpty()
  idioma!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  numCopias!: number;
}

export class UpdateEdicionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  isbn?: string;

  @IsOptional()
  @IsDateString()       
  año!: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  idioma?: string;
}