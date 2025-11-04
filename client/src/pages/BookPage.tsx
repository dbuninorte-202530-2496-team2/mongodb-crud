import { useEffect, useState } from 'react';
import { ArrowLeft, Book} from 'lucide-react';
import {api} from '../api/api';
import { EditableField } from '../components/EditableField';
import { Libro } from '../api/types';
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { AutoresEditor } from '../components/autor/AutoresEditor';
import { EdicionesEditor } from '../components/edicion/EdicionEditor';

export function BookPage() {
  const [libro, setLibro] = useState<Libro | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [libroData] = await Promise.all([
        api.getLibro(id!)
      ]);
      setLibro(libroData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id])

  if (!libro) return <p>Cargando...</p>

  const handleUpdateField = async (field: keyof Libro, value: string) => {
    if (!libro) return;
    await api.updateLibro(libro._id, { [field]: value });
    await loadData();
  };

  const handleReloadData = async () => {
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando libro...</div>
      </div>
    );
  }

  if (!libro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Libro no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al catálogo</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{libro.titulo}</h1>
              <p className="text-gray-600 mt-1">
                {libro.autores && libro.autores.length > 0 ? (
                  libro.autores.map((a, i) => (
                    <span key={i} className="block">{a.nombre} </span>
                  ))
                ) : (
                  'Autor desconocido'
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información del Libro</h2>
              <div className="space-y-4">
                <EditableField
                  label="Título"
                  value={libro.titulo}
                  onSave={(value) => handleUpdateField('titulo', value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ediciones</h2>
              {libro.ediciones && libro.ediciones.length > 0 ? (
                <div className="space-y-4">
                  {libro.ediciones.map((edicion) => (
                    <div key={edicion._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {edicion.año instanceof Date ? edicion.año.getFullYear() : edicion.año}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay ediciones registradas</p>
              )}
            </div>

          <AutoresEditor
              autores={libro.autores}
              libroId={libro._id}
              onUpdate={handleReloadData}
          />

          <EdicionesEditor
              ediciones={libro.ediciones}
              libroId={libro._id}
              onUpdate={handleReloadData}
          />
          </div>
        </div>
      </main>
    </div>
  );
}
