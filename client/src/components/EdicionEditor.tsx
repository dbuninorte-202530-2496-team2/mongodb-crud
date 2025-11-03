import { useState } from 'react';
import { Edit2, X, Plus, Trash2, User, BookOpen, Check, Loader2 } from 'lucide-react';
import { Edicion } from '../api/types';


interface EdicionesEditorProps {
  ediciones: Edicion[];
  libroId: string;
  onUpdate: () => Promise<void>;
}


export function EdicionesEditor({ ediciones, libroId, onUpdate }: EdicionesEditorProps) {
  const [editing, setEditing] = useState(false);
  const [localEdiciones, setLocalEdiciones] = useState<Edicion[]>(ediciones || []);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const saveEdiciones = async (updatedEdiciones: Edicion[]) => {
    try {
      const edicionesFormateadas = updatedEdiciones.map(e => ({
        ...e,
        año: e.año instanceof Date ? e.año : new Date(e.año, 0, 1)
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/libros/${libroId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ediciones: edicionesFormateadas }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar ediciones');
      }

      await onUpdate();
    } catch (error) {
      console.error('Error al actualizar ediciones:', error);
      alert('Error al guardar las ediciones');
    }
  };

  const handleAddEdicion = async () => {
    const newEdicion = {
      _id: Date.now(),
      año: new Date(),
      isbn: '',
      idioma: 'Español',
      copias: []
    };
    const updated = [...localEdiciones, newEdicion];
    setLocalEdiciones(updated);
    await saveEdiciones(updated);
  };

  const handleRemoveEdicion = async (index: number) => {
    if (!confirm('¿Estás seguro de eliminar esta edición?')) return;
    
    setSavingIndex(index);
    const updated = localEdiciones.filter((_, i) => i !== index);
    setLocalEdiciones(updated);
    await saveEdiciones(updated);
    setSavingIndex(null);
  };

  const handleEdicionChange = async (index: number, field: keyof Edicion, value: string | number | Date) => {
    setSavingIndex(index);
    const updated = [...localEdiciones];
    updated[index] = { ...updated[index], [field]: value };
    setLocalEdiciones(updated);
    
    // Debounce
    await new Promise(resolve => setTimeout(resolve, 1000));
    await saveEdiciones(updated);
    setSavingIndex(null);
  };

  const handleEdicionBlur = async (index: number) => {
    if (savingIndex === index) return;
    
    setSavingIndex(index);
    await saveEdiciones(localEdiciones);
    setSavingIndex(null);
  };

  if (!editing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Ediciones
          </h2>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
        <div className="space-y-3">
          {ediciones && ediciones.length > 0 ? (
            ediciones.map((edicion, i) => (
              <div key={edicion._id || i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Año</span>
                    <p className="text-gray-900 font-medium">
                      {edicion.año instanceof Date ? edicion.año.getFullYear() : edicion.año}
                    </p>
                  </div>
                  {edicion.isbn && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase">ISBN</span>
                      <p className="text-gray-900 font-mono text-sm">{edicion.isbn}</p>
                    </div>
                  )}
                  {edicion.idioma && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Idioma</span>
                      <p className="text-gray-900">{edicion.idioma}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No hay ediciones registradas</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Editar Ediciones
          <span className="text-xs text-gray-500 font-normal ml-2">Los cambios se guardan automáticamente</span>
        </h2>
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Check className="w-4 h-4" />
          Listo
        </button>
      </div>
      <div className="space-y-4">
        {localEdiciones.map((edicion, index) => (
          <div key={edicion._id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
            {savingIndex === index && (
              <div className="absolute top-2 right-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Año</label>
                <input
                  type="number"
                  value={edicion.año instanceof Date ? edicion.año.getFullYear() : new Date(edicion.año).getFullYear()}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    handleEdicionChange(index, 'año', new Date(year, 0, 1));
                  }}
                  onBlur={() => handleEdicionBlur(index)}
                  min="1000"
                  max="2100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">ISBN</label>
                <input
                  type="text"
                  value={edicion.isbn || ''}
                  onChange={(e) => handleEdicionChange(index, 'isbn', e.target.value)}
                  onBlur={() => handleEdicionBlur(index)}
                  placeholder="978-3-16-148410-0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Idioma</label>
                <input
                  type="text"
                  value={edicion.idioma || ''}
                  onChange={(e) => handleEdicionChange(index, 'idioma', e.target.value)}
                  onBlur={() => handleEdicionBlur(index)}
                  placeholder="Español"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => handleRemoveEdicion(index)}
              disabled={savingIndex === index}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar edición
            </button>
          </div>
        ))}
        <button
          onClick={handleAddEdicion}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors w-full justify-center border border-dashed border-blue-300"
        >
          <Plus className="w-4 h-4" />
          Agregar Edición
        </button>
      </div>
    </div>
  );
}