import { IsDateString, IsOptional } from "class-validator";

export class UpdatePrestamoDto {
    @IsDateString()
    @IsOptional()
    fecha_prestamo?: string;

    @IsDateString()
    @IsOptional()
    fecha_devolucion?: string;
}