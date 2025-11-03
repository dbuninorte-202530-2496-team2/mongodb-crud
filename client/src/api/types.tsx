export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

export interface Autor {
  _id?: number;
  nombre: string;
}

export interface Edicion {
  _id?: number;
  isbn: string;
  idioma: string;
  año: Date;
  copias?: Copia[];
}

export interface Copia {
  id: number;
  edicion_id: number;
  numero_copia: number;
}

export interface Libro {
  _id: string;
  titulo: string;
  autores: Autor[];
  ediciones: Edicion[];
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface Prestamo {
  id: number;
  copiaId: number;
  usuarioId: number;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal?: string;
  estado: 'activo' | 'devuelto' | 'vencido';
}