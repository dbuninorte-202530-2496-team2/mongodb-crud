import { useState } from "react";
import { Autor } from "../../api/types";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { api } from "../../api/api";
import { capitalize } from '../../utils/stringFormatting';

export default function AutoresSection({ 
  autores, 
  libroId, 
  onReload 
}: { 
  autores: Autor[]; 
  libroId: string; 
  onReload: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newAutorName, setNewAutorName] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleEditAutor = async (autorId: string) => {
    if (editValue.trim() === '') return;
    setLoading(autorId);
    await api.updateAutor(autorId, { nombre: editValue.trim() });
    setEditingId(null);
    onReload();
    setLoading(null);
  };

  const handleAddAutor = async () => {
    if (newAutorName.trim() === '') return;
    setLoading('new');
    await api.createAutor(libroId, newAutorName.trim());
    setAddingNew(false);
    setNewAutorName('');
    onReload();
    setLoading(null);
  };

  const handleUnlinkAutor = async (autorId: string) => {
    if (!confirm('¿Desvincular este autor del libro?')) return;
    setLoading(autorId);
    await api.unlinkAutor(libroId, autorId);
    onReload();
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Autores</h2>
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Añadir autor
        </button>
      </div>

      <div className="space-y-3">
        {autores.map((autor) => (
          <div key={autor._id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
            {editingId === autor._id ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none"
                  autoFocus
                  disabled={loading === autor._id}
                />
                <button
                  onClick={() => handleEditAutor(autor._id!)}
                  disabled={loading === autor._id}
                  className="p-1 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  disabled={loading === autor._id}
                  className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-gray-900">{capitalize(autor.nombre)}</span>
                <button
                  onClick={() => {
                    setEditingId(autor._id!);
                    setEditValue(autor.nombre);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleUnlinkAutor(autor._id!)}
                  disabled={loading === autor._id}
                  className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </>
            )}
          </div>
        ))}

        {addingNew && (
          <div className="flex items-center gap-2 p-3 border-2 border-blue-500 rounded-lg bg-blue-50">
            <input
              type="text"
              value={newAutorName}
              onChange={(e) => setNewAutorName(e.target.value)}
              placeholder="Nombre del autor"
              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none"
              autoFocus
              disabled={loading === 'new'}
            />
            <button
              onClick={handleAddAutor}
              disabled={loading === 'new'}
              className="p-1 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={() => {
                setAddingNew(false);
                setNewAutorName('');
              }}
              disabled={loading === 'new'}
              className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}