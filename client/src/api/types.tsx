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
  _id: number;
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
  _id: number;
  RUT: string;
  nombre: string;
}

export interface Prestamo {
  _id: number;
  copia_id: number;
  usuario_id: number;
  fecha_prestamo: Date;
  fecha_devolucion: Date;
}

export interface PrestamoDetalle {
  _id: string;
  fecha_prestamo: string;      
  fecha_devolucion: string;     
  copia: {
    _id: string;
    numero_copia: number;
    edicion: {
      _id: string;
      isbn: string;
      idioma: string;
      año: string;      
      libro: {
        _id: string;
        titulo: string;
      };
    };
  };
}

export interface CopiaDetalle {
  _id: string;
  numero_copia: number;
  edicion: {
    _id: string;
    isbn: string;
    idioma: string;
    año: string;
    libro: {
      _id: string;
      titulo: string;
      autores: Array<{
        _id: string;
        nombre: string;
      }>;
    };
  };
  prestamos_activos: number;
}