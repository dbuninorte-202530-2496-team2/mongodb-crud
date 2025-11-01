import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateLibroDto {
  @IsString()
  @IsNotEmpty({ message: 'Campo "titulo" requerido.' })
  titulo!: string;
}