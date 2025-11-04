import { useEffect, useState } from 'react';
import { ArrowLeft, Book, Trash2 } from 'lucide-react';
import { Libro } from '../api/types';
import { EditableTitleField } from '../components/EditableTitle';
import AutoresSection from '../components/autor/AutoresSection';
import { EdicionesSection } from '../components/edicion/EdicionesSection';
import { api } from '../api/api';
import { useNavigate, useParams } from 'react-router-dom';


export function BookPage() {
  const navigate = useNavigate();

  const [libro, setLibro] = useState<Libro | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { id } = useParams<{ id: string }>();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getLibro(id||'');
      setLibro(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTitulo = async (nuevoTitulo: string) => {
    if (!libro) return;
    await api.updateLibro(libro._id, { titulo: nuevoTitulo });
    await loadData();
  };

  const handleDeleteLibro = async () => {
    if (!libro) return;
    try {
      await api.deleteLibro(libro._id);
      navigate('..');
    } catch (error) {
      console.error('Error al eliminar libro:', error);
    }
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
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('..')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al catálogo</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar libro</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div>
              <EditableTitleField titulo={libro.titulo} onSave={handleUpdateTitulo} />
              <p className="text-gray-600 mt-1">
                {libro.autores.length} {libro.autores.length === 1 ? 'autor' : 'autores'} • {libro.ediciones.length} {libro.ediciones.length === 1 ? 'edición' : 'ediciones'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AutoresSection 
            autores={libro.autores} 
            libroId={libro._id} 
            onReload={loadData} 
          />
          <EdicionesSection 
            ediciones={libro.ediciones} 
            libroId={libro._id} 
            onUpdate={loadData} 
          />
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Eliminar libro?
                </h3>
                <p className="text-gray-600 mb-1">
                  Esta acción eliminará permanentemente el libro <span className="font-semibold text-gray-900">"{libro?.titulo}"</span> y todas sus ediciones.
                </p>
                <p className="text-red-600 font-medium mb-6">
                  Si algún autor se queda sin libros, también será eliminado.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteLibro}
                    className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium shadow-sm"
                  >
                    Eliminar libro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}