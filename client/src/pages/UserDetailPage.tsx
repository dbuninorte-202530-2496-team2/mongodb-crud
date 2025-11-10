import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, Book, User, CreditCard, Save, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api/api';
import { Usuario, PrestamoDetalle } from '../api/types';
import { capitalize } from '../utils/stringFormatting';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [prestamos, setPrestamos] = useState<PrestamoDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingPrestamo, setEditingPrestamo] = useState<string | null>(null);
  const [prestamoForm, setPrestamoForm] = useState({
    fecha_prestamo: '',
    fecha_devolucion: ''
  });
  const [originalPrestamo, setOriginalPrestamo] = useState({
    fecha_prestamo: '',
    fecha_devolucion: ''
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [usuarioData, prestamosData] = await Promise.all([
        api.getUsuario(id),
        api.getPrestamosUsuario(id)
      ]);
      setUsuario(usuarioData);
      setNewName(usuarioData.nombre);
      setPrestamos(Array.isArray(prestamosData) ? prestamosData : [prestamosData]);
    } catch (error) {
      toast.error('Error cargando datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!id || !newName.trim()) return;

    try {
      await api.updateUsuario(id, { nombre: newName.trim() });
      toast.success('Nombre actualizado');
      setEditingName(false);
      await loadData();
    } catch (error) {
      toast.error('Error actualizando nombre');
      console.error('Error updating name:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!id) return;
    
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.deleteUsuario(id);
      toast.success('Usuario eliminado');
      navigate('/users');
    } catch (error) {
      toast.error('Error eliminando usuario');
      console.error('Error deleting user:', error);
    }
  };

  const startEditPrestamo = (prestamo: PrestamoDetalle) => {
    const fechaPrestamo = prestamo.fecha_prestamo.split('T')[0];
    const fechaDevolucion = prestamo.fecha_devolucion?.split('T')[0] || '';
    
    setEditingPrestamo(prestamo._id);
    setPrestamoForm({
      fecha_prestamo: fechaPrestamo,
      fecha_devolucion: fechaDevolucion
    });
    // Guardar valores originales para comparar
    setOriginalPrestamo({
      fecha_prestamo: fechaPrestamo,
      fecha_devolucion: fechaDevolucion
    });
  };

  const handleUpdatePrestamo = async (prestamoId: string) => {
    try {
      const updateData: { fecha_prestamo?: string; fecha_devolucion?: string } = {};
      
      // Solo incluir campos que realmente cambiaron
      if (prestamoForm.fecha_prestamo !== originalPrestamo.fecha_prestamo) {
        // Convertir a ISO string con hora al inicio del día
        const date = new Date(prestamoForm.fecha_prestamo + 'T00:00:00');
        updateData.fecha_prestamo = date.toISOString();
      }
      
      if (prestamoForm.fecha_devolucion !== originalPrestamo.fecha_devolucion) {
        if (prestamoForm.fecha_devolucion) {
          const date = new Date(prestamoForm.fecha_devolucion + 'T00:00:00');
          updateData.fecha_devolucion = date.toISOString();
        } else {
          // Si se borró la fecha de devolución, enviar null o string vacío según backend
          updateData.fecha_devolucion = '';
        }
      }

      // Si no hay cambios, no hacer la petición
      if (Object.keys(updateData).length === 0) {
        toast.info('No hay cambios para guardar');
        setEditingPrestamo(null);
        return;
      }

      await api.updatePrestamo(prestamoId, updateData);
      toast.success('Préstamo actualizado');
      setEditingPrestamo(null);
      await loadData();
    } catch (error) {
      toast.error('Error actualizando préstamo');
      console.error('Error updating prestamo:', error);
    }
  };

  const handleDeletePrestamo = async (prestamoId: string) => {
    if (!confirm('¿Eliminar este préstamo?')) return;

    try {
      await api.deletePrestamo(prestamoId);
      toast.success('Préstamo eliminado');
      await loadData();
    } catch (error) {
      toast.error('Error eliminando préstamo');
      console.error('Error deleting prestamo:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Usuario no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a usuarios</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-2xl font-bold border-b-2 border-green-600 focus:outline-none px-1"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateName}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNewName(usuario.nombre);
                      }}
                      className="p-1 text-gray-600 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {capitalize(usuario.nombre)}
                    </h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <CreditCard className="w-4 h-4" />
                  <span>{usuario.RUT}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDeleteUser}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Eliminar Usuario</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Book className="w-6 h-6" />
            Préstamos
          </h2>

          {prestamos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay préstamos registrados</p>
          ) : (
            <div className="space-y-4">
              {prestamos.map((prestamo) => (
                <div
                  key={prestamo._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  {editingPrestamo === prestamo._id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Préstamo
                          </label>
                          <input
                            type="date"
                            value={prestamoForm.fecha_prestamo}
                            onChange={(e) => setPrestamoForm({ ...prestamoForm, fecha_prestamo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Devolución
                          </label>
                          <input
                            type="date"
                            value={prestamoForm.fecha_devolucion}
                            onChange={(e) => setPrestamoForm({ ...prestamoForm, fecha_devolucion: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdatePrestamo(prestamo._id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <Save className="w-4 h-4" />
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingPrestamo(null)}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {prestamo.copia.edicion.libro.titulo}
                          </h3>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 ml-7">
                          <p>ISBN: {prestamo.copia.edicion.isbn} • Idioma: {prestamo.copia.edicion.idioma} • Año: {new Date(prestamo.copia.edicion.año).getFullYear()}</p>
                          <p>Copia #{prestamo.copia.numero_copia}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Préstamo: {new Date(prestamo.fecha_prestamo).toLocaleDateString()}</span>
                            </div>
                            {prestamo.fecha_devolucion && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Devolución: {new Date(prestamo.fecha_devolucion).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditPrestamo(prestamo)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrestamo(prestamo._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}