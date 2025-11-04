import { useState } from 'react';
import { Edit2, X, Plus, Trash2, User, BookOpen, Check, Loader2 } from 'lucide-react';
import { Autor } from '../../api/types';

interface AutoresEditorProps {
  autores: Autor[];
  libroId: string;
  onUpdate: () => Promise<void>;
}

export function AutoresEditor({ autores, libroId, onUpdate }: AutoresEditorProps) {
  const [editing, setEditing] = useState(false);
  const [localAutores, setLocalAutores] = useState<Autor[]>(autores || []);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const saveAutores = async (updatedAutores: Autor[]) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/libros/${libroId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ autores: updatedAutores }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar autores');
      }

      await onUpdate();
    } catch (error) {
      console.error('Error al actualizar autores:', error);
      alert('Error al guardar los autores');
    }
  };

  const handleAddAutor = async () => {
    const newAutor = { nombre: 'Nuevo Autor' } as Autor;
    const updated = [...localAutores, newAutor];
    setLocalAutores(updated);
    await saveAutores(updated);
  };

  const handleRemoveAutor = async (index: number) => {
    if (!confirm('¿Estás seguro de eliminar este autor?')) return;
    
    setSavingIndex(index);
    const updated = localAutores.filter((_, i) => i !== index);
    setLocalAutores(updated);
    await saveAutores(updated);
    setSavingIndex(null);
  };

  const handleAutorChange = async (index: number, value: string) => {
    if (value.trim() === '') return;
    
    setSavingIndex(index);
    const updated = [...localAutores];
    updated[index] = { ...updated[index], nombre: value };
    setLocalAutores(updated);
    
    // Debounce: esperar 1 segundo antes de guardar
    await new Promise(resolve => setTimeout(resolve, 1000));
    await saveAutores(updated);
    setSavingIndex(null);
  };

  const handleAutorBlur = async (index: number) => {
    if (savingIndex === index) return;
    
    const autor = localAutores[index];
    if (autor.nombre.trim() === '') {
      // Si está vacío, eliminar
      await handleRemoveAutor(index);
    } else {
      // Guardar cambios al perder foco
      setSavingIndex(index);
      await saveAutores(localAutores);
      setSavingIndex(null);
    }
  };

  if (!editing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Autores
          </h2>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
        <div className="space-y-2">
          {autores && autores.length > 0 ? (
            autores.map((autor, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{autor.nombre}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No hay autores registrados</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5" />
          Editar Autores
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
      <div className="space-y-3">
        {localAutores.map((autor, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={autor.nombre}
              onChange={(e) => handleAutorChange(index, e.target.value)}
              onBlur={() => handleAutorBlur(index)}
              placeholder="Nombre del autor"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {savingIndex === index ? (
              <div className="p-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <button
                onClick={() => handleRemoveAutor(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddAutor}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors w-full justify-center border border-dashed border-blue-300"
        >
          <Plus className="w-4 h-4" />
          Agregar Autor
        </button>
      </div>
    </div>
  );
}