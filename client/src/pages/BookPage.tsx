import { useEffect, useState } from 'react';
import { ArrowLeft, Book } from 'lucide-react';
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
            onClick={() => navigate('..')}
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
    </div>
  );
}
