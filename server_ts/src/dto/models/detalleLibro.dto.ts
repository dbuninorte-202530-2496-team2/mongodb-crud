import { IsString, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEdicionDto } from './edicion.dto.js';

export class DetalleLibroDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  autores!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEdicionDto)
  @ArrayMinSize(1)
  ediciones!: CreateEdicionDto[];
}