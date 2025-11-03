// CreateUsuarioDto
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{7,8}-[\dkK]$/, { 
    message: 'RUT debe tener formato válido (ej: 12345678-9)' 
  })
  rut!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;
}

// UpdateUsuarioDto
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;
}