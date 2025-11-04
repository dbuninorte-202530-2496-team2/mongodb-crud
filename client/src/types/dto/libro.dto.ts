import { CreateEdicionDto } from "./edicion.dto";

export interface CreateDetalleLibroDto {
      titulo: string;
      autores: string[];
      ediciones: CreateEdicionDto[];
}

export interface UpdateLibroDto {
  titulo?: string;
}