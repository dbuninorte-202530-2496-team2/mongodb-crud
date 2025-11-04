export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

export interface Autor {
  _id: string;
  nombre: string;
}

export interface Edicion {
  _id: string;
  isbn: string;
  idioma: string;
  año: string;
  copias: Copia[];
}

export interface Copia {
  _id: string;
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
  _id: string;
  RUT: string;
  nombre: string;
}

export interface Prestamo {
  _id: string;
  copia_id: string;
  usuario_id: string;
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