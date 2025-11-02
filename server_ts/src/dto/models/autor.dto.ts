import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAutorDto {
  @IsString()
  @IsNotEmpty({ message: 'Campo "nombre" requerido.' })
  nombre!: string;
}

export class UpdateAutorDto {
  @IsString()
  @IsNotEmpty({ message: 'Campo "nombre" requerido.' })
  nombre!: string;
}