import { IsString, IsNotEmpty, IsInt, Min, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEdicionDto {
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

export class UpdateEdicionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  isbn?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()         
  año?: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  idioma?: string;
}