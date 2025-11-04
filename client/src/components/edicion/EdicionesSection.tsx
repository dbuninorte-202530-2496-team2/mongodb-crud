import { useState } from "react";
import { Edit2, Package, Plus, Trash2, X } from "lucide-react";
import { api } from "../../api/api";
import { capitalize } from "../../utils/stringFormatting";

interface Copia {
  _id: string;
  numero_copia: number;
}

interface Edicion {
  _id: string;
  isbn: string;
  idioma: string;
  año: string;
  copias: Copia[];
}

interface EdicionesEditorProps {
  ediciones: Edicion[];
  libroId: string;
  onUpdate: () => void;
}

export function EdicionesSection({ ediciones, libroId, onUpdate }: EdicionesEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Edicion>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newEdicion, setNewEdicion] = useState({ isbn: '', idioma: '', año: '', numCopias: '1' });
  const [loading, setLoading] = useState<string | null>(null);
  const [copiaQuantity, setCopiaQuantity] = useState<{ [key: string]: number }>({});

  const handleEditEdicion = async (edicionId: string) => {
    try {
      setLoading(edicionId);
      const { copias, _id, ...dataToSend } = editData as any;
      // Convertir año a número si existe
      const payload = { ...dataToSend };
      await api.updateEdicion(edicionId, payload);
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating edicion:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleAddEdicion = async () => {
    if (!newEdicion.isbn || !newEdicion.idioma || !newEdicion.año || !newEdicion.numCopias) {
      alert('Completa todos los campos');
      return;
    }
    try {
      setLoading('new');
      await api.createEdicion(libroId, {
        isbn: newEdicion.isbn,
        idioma: newEdicion.idioma,
        año: newEdicion.año,
        numCopias: parseInt(newEdicion.numCopias)
      });
      setAddingNew(false);
      setNewEdicion({ isbn: '', idioma: '', año: '', numCopias: '1' });
      onUpdate();
    } catch (error) {
      console.error('Error creating edicion:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteEdicion = async (edicionId: string) => {
    if (ediciones.length <= 1) {
      alert('No puedes eliminar la última edición');
      return;
    }
    if (!confirm('¿Eliminar esta edición?')) return;
    try {
      setLoading(edicionId);
      await api.deleteEdicion(edicionId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting edicion:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleAddCopia = async (edicionId: string) => {
    const cantidad = copiaQuantity[edicionId] || 1;
    try {
      setLoading(edicionId);
      await api.createCopia(edicionId, cantidad);
      setCopiaQuantity({ ...copiaQuantity, [edicionId]: 1 });
      onUpdate();
    } catch (error) {
      console.error('Error adding copia:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteCopia = async (copiaId: string, edicionId: string) => {
    if (!confirm('¿Eliminar esta copia?')) return;
    try {
      setLoading(edicionId);
      await api.deleteCopia(copiaId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting copia:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Ediciones</h2>
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      <div className="space-y-4">
        {ediciones.map((edicion) => (
          <div key={edicion._id} className="border border-gray-200 rounded-lg p-4">
            {editingId === edicion._id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editData.isbn ?? edicion.isbn}
                  onChange={(e) => setEditData({ ...editData, isbn: e.target.value })}
                  placeholder="ISBN"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading === edicion._id}
                />
                <input
                  type="text"
                  value={editData.idioma ?? edicion.idioma}
                  onChange={(e) => setEditData({ ...editData, idioma: e.target.value })}
                  placeholder="Idioma"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading === edicion._id}
                />
                <input
                  type="text"
                  value={editData.año ?? edicion.año}
                  onChange={(e) => setEditData({ ...editData, año: e.target.value })}
                  placeholder="Año"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading === edicion._id}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEdicion(edicion._id)}
                    disabled={loading === edicion._id}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={loading === edicion._id}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900">ISBN: {edicion.isbn}</div>
                    <div className="text-sm text-gray-600">{capitalize(edicion.idioma)} • {edicion.año.slice(0, 4)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(edicion._id);
                        setEditData({ isbn: edicion.isbn, idioma: edicion.idioma, año: edicion.año });
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteEdicion(edicion._id)}
                      disabled={loading === edicion._id || ediciones.length <= 1}
                      className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      Copias ({edicion.copias?.length || 0})
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={copiaQuantity[edicion._id] || 1}
                        onChange={(e) => setCopiaQuantity({ ...copiaQuantity, [edicion._id]: parseInt(e.target.value) || 1 })}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        disabled={loading === edicion._id}
                      />
                      <button
                        onClick={() => handleAddCopia(edicion._id)}
                        disabled={loading === edicion._id}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                  {edicion.copias && edicion.copias.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {edicion.copias.map((copia) => (
                        <div
                          key={copia._id}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          <span>#{copia.numero_copia}</span>
                          <button
                            onClick={() => handleDeleteCopia(copia._id, edicion._id)}
                            disabled={loading === edicion._id}
                            className="hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {addingNew && (
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium text-gray-900 mb-3">Nueva Edición</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newEdicion.isbn}
                onChange={(e) => setNewEdicion({ ...newEdicion, isbn: e.target.value })}
                placeholder="ISBN"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                disabled={loading === 'new'}
              />
              <input
                type="text"
                value={newEdicion.idioma}
                onChange={(e) => setNewEdicion({ ...newEdicion, idioma: e.target.value })}
                placeholder="Idioma"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                disabled={loading === 'new'}
              />
              <input
                type="number"
                value={newEdicion.año}
                onChange={(e) => setNewEdicion({ ...newEdicion, año: e.target.value })}
                placeholder="Año"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                disabled={loading === 'new'}
              />
              <input
                type="number"
                min="1"
                value={newEdicion.numCopias}
                onChange={(e) => setNewEdicion({ ...newEdicion, numCopias: e.target.value })}
                placeholder="Número de copias"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                disabled={loading === 'new'}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddEdicion}
                  disabled={loading === 'new'}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  Crear
                </button>
                <button
                  onClick={() => {
                    setAddingNew(false);
                    setNewEdicion({ isbn: '', idioma: '', año: '', numCopias: '1' });
                  }}
                  disabled={loading === 'new'}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}