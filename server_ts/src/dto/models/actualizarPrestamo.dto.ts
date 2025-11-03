import { IsString, IsOptional, IsDateString } from "class-validator";

export class UpdatePrestamoDto {
    @IsString()
    @IsOptional()
    rut?: string;

    @IsString()
    @IsOptional()
    numero_copia?: number;

    @IsDateString()
    @IsOptional()
    fecha_prestamo?: string;

    @IsDateString()
    @IsOptional()
    fecha_devolucion?: string;
}