import { CreateDetalleLibroDto } from "../types/dto/libro.dto";
import { Libro, Autor, Usuario, Prestamo, PaginatedResponse } from "./types";

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

    return response.json();
  }

  async getLibros(): Promise<Libro[]> {
    const response = await this.fetchApi<PaginatedResponse<Libro>>('/libros');
    return response.data;
  }

  async getLibro(id: number): Promise<Libro> {
    return this.fetchApi<Libro>(`/libros/${id}`);
  }

  async createLibro(data: Omit<CreateDetalleLibroDto, 'id'>): Promise<any> {
    return this.fetchApi<Libro>('/libros', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLibro(id: number, data: Partial<Libro>): Promise<Libro> {
    return this.fetchApi<Libro>(`/libros/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLibro(id: number): Promise<void> {
    return this.fetchApi<void>(`/libros/${id}`, {
      method: 'DELETE',
    });
  }

  async getAutores(): Promise<Autor[]> {
    const response = await this.fetchApi<PaginatedResponse<Autor>>('/autores');
    return response.data.filter(a => a.nombre != 'anonimo');
  }

  async createAutor(data: Omit<Autor, 'id'>): Promise<Autor> {
    return this.fetchApi<Autor>('/autores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsuarios(): Promise<Usuario[]> {
    return this.fetchApi<Usuario[]>('/usuarios');
  }

  async createUsuario(data: Omit<Usuario, 'id'>): Promise<Usuario> {
    return this.fetchApi<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPrestamo(data: Omit<Prestamo, 'id' | 'fechaPrestamo' | 'estado'>): Promise<Prestamo> {
    return this.fetchApi<Prestamo>('/prestamos', {
      method: 'POST',
      body: JSON.stringify(data),
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