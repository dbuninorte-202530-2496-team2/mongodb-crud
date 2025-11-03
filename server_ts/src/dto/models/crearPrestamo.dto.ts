import { IsString, IsNotEmpty, IsDateString, Matches, IsNumber } from "class-validator";

export class CreatePrestamoDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{7,8}-[\dkK]$/, {
        message: 'RUT debe tener formato válido (ej: 12345678-9)'
    })
    rut!: string;

    @IsNumber()
    @IsNotEmpty({ message: "El numero de la copia es requerido" })
    numero_copia!: number;

    @IsDateString()
    @IsNotEmpty({ message: "La fecha de préstamo es requerida" })
    fecha_prestamo!: string;

    @IsDateString()
    @IsNotEmpty({ message: "La fecha de devolución es requerida" })
    fecha_devolucion!: string;
}