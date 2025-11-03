// UpdateUsuarioDto
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;
}