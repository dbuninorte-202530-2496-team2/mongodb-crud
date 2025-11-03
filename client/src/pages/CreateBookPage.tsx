import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { api, Autor } from '../services/api';

interface NewBookProps {
  onNavigate: (page: string, data?: any) => void;
}

export function CreateBookPage({ onNavigate }: NewBookProps) {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [showNewAutor, setShowNewAutor] = useState(false);
  const [formData, setFormData] = useState({
    isbn: '',
    titulo: '',
    autorId: '',
  });
  const [autorData, setAutorData] = useState({
    nombre: '',
    apellido: '',
    nacionalidad: '',
  });

  useEffect(() => {
    loadAutores();
  }, []);

  const loadAutores = async () => {
    try {
      const data = await api.getAutores();
      setAutores(data);
    } catch (error) {
      console.error('Error loading authors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const libro = await api.createLibro({
        isbn: formData.isbn,
        titulo: formData.titulo,
        autorId: Number(formData.autorId),
      });
      onNavigate('book', libro.id);
    } catch (error) {
      console.error('Error creating book:', error);
    }
  };

  const handleCreateAutor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const autor = await api.createAutor(autorData);
      await loadAutores();
      setFormData({ ...formData, autorId: String(autor.id) });
      setShowNewAutor(false);
      setAutorData({ nombre: '', apellido: '', nacionalidad: '' });
    } catch (error) {
      console.error('Error creating author:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al catálogo</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Libro</h1>
              <p className="text-sm text-gray-600">Agregar un nuevo libro al catálogo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN *
              </label>
              <input
                type="text"
                required
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="978-3-16-148410-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="El nombre del libro"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Autor *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewAutor(!showNewAutor)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showNewAutor ? 'Seleccionar existente' : '+ Nuevo autor'}
                </button>
              </div>

              {showNewAutor ? (
                <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={autorData.nombre}
                      onChange={(e) => setAutorData({ ...autorData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={autorData.apellido}
                      onChange={(e) => setAutorData({ ...autorData, apellido: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nacionalidad
                    </label>
                    <input
                      type="text"
                      value={autorData.nacionalidad}
                      onChange={(e) => setAutorData({ ...autorData, nacionalidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateAutor}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Crear y seleccionar autor
                  </button>
                </div>
              ) : (
                <select
                  required
                  value={formData.autorId}
                  onChange={(e) => setFormData({ ...formData, autorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar autor</option>
                  {autores.map((autor) => (
                    <option key={autor.id} value={autor.id}>
                      {autor.nombre} {autor.apellido}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Crear Libro
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
