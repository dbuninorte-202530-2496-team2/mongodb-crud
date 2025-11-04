import { UpdateAutorDto } from "../types/dto/autor.dto";
import { CreateEdicionDto, UpdateEdicionDto } from "../types/dto/edicion.dto";
import { CreateDetalleLibroDto } from "../types/dto/libro.dto";
import { Libro, Autor, Usuario, Prestamo, PaginatedResponse, PrestamoDetalle, CopiaDetalle, Edicion, Copia } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Para DELETE exitosos (204), retornar undefined
    if (response.status === 204 || !response.headers.get('content-length')) {
      return undefined as T;
    }

    return response.json();
  }

  // Libros
  async getLibros(): Promise<Libro[]> {
    const response = await this.fetchApi<PaginatedResponse<Libro>>('/libros?limit=1000');
    return response.data;
  }

  async getLibro(id: string): Promise<Libro> {
    return this.fetchApi<Libro>(`/libros/${id}`);
  }

  async createLibro(data: Omit<CreateDetalleLibroDto, 'id'>): Promise<any> {
    return this.fetchApi<Libro>('/libros', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLibro(id: string, data: Partial<Libro>): Promise<Libro> {
    return this.fetchApi<Libro>(`/libros/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLibro(id: string): Promise<void> {
    return this.fetchApi<void>(`/libros/${id}`, {
      method: 'DELETE',
    });
  }

  // Autores
  async getAutores(): Promise<Autor[]> {
    const response = await this.fetchApi<PaginatedResponse<Autor>>('/autores');
    return response.data.filter(a => a.nombre != 'anonimo');
  }

  async updateAutor(autorId: string, data: UpdateAutorDto): Promise<Autor> {
    return this.fetchApi<Autor>(`/autores/${autorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createAutor(libroId: string, nombre: string): Promise<Autor> {
    return this.fetchApi<Autor>(`/autores/libro/${libroId}`, {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
  }

  async unlinkAutor(libroId: string, autorId: string): Promise<void> {
    return this.fetchApi<void>(`/autores/${autorId}/libro/${libroId}`, {
      method: 'DELETE',
    });
  }

  //Edicion

  async createEdicion(libroId: string, data: CreateEdicionDto): Promise<Edicion> {
    console.log(data)
    return this.fetchApi<Edicion>(`/ediciones/libro/${libroId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEdicion(edicionId: string, data: UpdateEdicionDto): Promise<Edicion> {
    return this.fetchApi<Edicion>(`/ediciones/${edicionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEdicion(edicionId: string): Promise<void> {
    return this.fetchApi<void>(`/ediciones/${edicionId}`, {
      method: 'DELETE',
    });
  }

  //Copias

  async getCopias(): Promise<CopiaDetalle[]> {
    const response = await this.fetchApi<PaginatedResponse<CopiaDetalle>>('/copias');
    return response.data;
  }

  async createCopia(edicionId: string, cantidad: number): Promise<any> {
    return this.fetchApi(`/copias/edicion/${edicionId}`, {
      method: 'POST',
      body: JSON.stringify({ cantidad }),
    });
  }

  async deleteCopia(copiaId: string): Promise<void> {
    return this.fetchApi<void>(`/copias/${copiaId}`, {
      method: 'DELETE',
    });
  }

  // Usuarios
  async getUsuarios(): Promise<Usuario[]> {
    const response = await this.fetchApi<PaginatedResponse<Usuario>>('/usuarios');
    return response.data;
  }

  async getUsuario(id: string): Promise<Usuario> {
    return this.fetchApi<Usuario>(`/usuarios/${id}`)
  }

  async createUsuario(data: Omit<Usuario, '_id'>): Promise<Usuario> {
    return this.fetchApi<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUsuario(id: string, data: { nombre: string }): Promise<{ ok: boolean; message: string }> {
    return this.fetchApi<{ ok: boolean; message: string }>(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUsuario(id: string): Promise<void> {
    return this.fetchApi<void>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  async getPrestamosUsuario(id: string): Promise<PrestamoDetalle[]> {
    // El backend devuelve un objeto con el usuario y sus prestamos anidados
    const response = await this.fetchApi<{
      _id: string;
      RUT: string;
      nombre: string;
      prestamos: PrestamoDetalle[]
    }>(`/usuarios/${id}/prestamos`);

    return response.prestamos || [];
  }

  // Prestamos
  async createPrestamo(data: Omit<Prestamo, 'id' | 'fechaPrestamo' | 'estado'>): Promise<Prestamo> {
    return this.fetchApi<Prestamo>('/prestamos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrestamo(id: string, data: { fecha_prestamo?: string; fecha_devolucion?: string }): Promise<Prestamo> {
    return this.fetchApi<Prestamo>(`/prestamos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePrestamo(id: string): Promise<void> {
    return this.fetchApi<void>(`/prestamos/${id}`, {
      method: 'DELETE',
    });
  }

  async devolverPrestamo(id: number): Promise<Prestamo> {
    return this.fetchApi<Prestamo>(`/prestamos/${id}/devolver`, {
      method: 'PATCH',
    });
  }

  async getPrestamosByCopia(copiaId: number): Promise<Prestamo[]> {
    return this.fetchApi<Prestamo[]>(`/prestamos?copiaId=${copiaId}`);
  }
}

export const api = new ApiService();