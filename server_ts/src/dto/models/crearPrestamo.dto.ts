import { IsNotEmpty, IsDateString, IsOptional, IsString } from "class-validator";

export class CreatePrestamoDto {
    @IsString()
    @IsNotEmpty({ message: "El ID del usuario es requerido" })
    usuario_id!: string;

    @IsString()
    @IsNotEmpty({ message: "El ID de la copia es requerido" })
    copia_id!: string;

    @IsDateString()
    @IsNotEmpty({ message: "La fecha de préstamo es requerida" })
    fecha_prestamo!: string;

    @IsDateString()
    @IsOptional()
    fecha_devolucion?: string;
}