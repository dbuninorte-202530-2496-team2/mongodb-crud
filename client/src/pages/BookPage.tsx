import { useEffect, useState } from 'react';
import { ArrowLeft, Book, Calendar, Package, User } from 'lucide-react';
import { api, Libro, Usuario } from '../services/api';
import { EditableField } from '../components/EditableField';

interface BookDetailProps {
  bookId: number;
  onNavigate: (page: string, data?: any) => void;
}

export function BookPage({ bookId, onNavigate }: BookDetailProps) {
  const [libro, setLibro] = useState<Libro | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedCopia, setSelectedCopia] = useState<number | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<number | null>(null);
  const [fechaDevolucion, setFechaDevolucion] = useState('');

  useEffect(() => {
    loadData();
  }, [bookId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [libroData, usuariosData] = await Promise.all([
        api.getLibro(bookId),
        api.getUsuarios()
      ]);
      setLibro(libroData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async (field: keyof Libro, value: string) => {
    if (!libro) return;
    await api.updateLibro(libro.id, { [field]: value });
    await loadData();
  };

  const handleLoan = async () => {
    if (!selectedCopia || !selectedUsuario || !fechaDevolucion) return;

    try {
      await api.createPrestamo({
        copiaId: selectedCopia,
        usuarioId: selectedUsuario,
        fechaDevolucionEsperada: fechaDevolucion,
      });
      setShowLoanModal(false);
      setSelectedCopia(null);
      setSelectedUsuario(null);
      setFechaDevolucion('');
      await loadData();
    } catch (error) {
      console.error('Error creating loan:', error);
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
          <button
            onClick={() => onNavigate('home')}
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
                {libro.autor ? `${libro.autor.nombre} ${libro.autor.apellido}` : 'Autor desconocido'}
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
                <EditableField
                  label="ISBN"
                  value={libro.isbn}
                  onSave={(value) => handleUpdateField('isbn', value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ediciones</h2>
              {libro.ediciones && libro.ediciones.length > 0 ? (
                <div className="space-y-4">
                  {libro.ediciones.map((edicion) => (
                    <div key={edicion.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          Edición #{edicion.numeroEdicion}
                        </span>
                        <span className="text-sm text-gray-600">{edicion.anioPublicacion}</span>
                      </div>
                      <p className="text-sm text-gray-600">Editorial: {edicion.editorial}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay ediciones registradas</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Copias</h2>
              {libro.copias && libro.copias.length > 0 ? (
                <div className="space-y-3">
                  {libro.copias.map((copia) => (
                    <div
                      key={copia.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {copia.codigoBarras}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            copia.estado === 'disponible'
                              ? 'bg-green-100 text-green-700'
                              : copia.estado === 'prestada'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {copia.estado}
                        </span>
                      </div>
                      {copia.estado === 'disponible' && (
                        <button
                          onClick={() => {
                            setSelectedCopia(copia.id);
                            setShowLoanModal(true);
                          }}
                          className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          Prestar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay copias registradas</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Resumen</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total copias:</span>
                  <span className="font-medium text-gray-900">{libro.copias?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponibles:</span>
                  <span className="font-medium text-green-600">
                    {libro.copias?.filter(c => c.estado === 'disponible').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prestadas:</span>
                  <span className="font-medium text-yellow-600">
                    {libro.copias?.filter(c => c.estado === 'prestada').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Registrar Préstamo</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <select
                  value={selectedUsuario || ''}
                  onChange={(e) => setSelectedUsuario(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar usuario</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} {usuario.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de devolución esperada
                </label>
                <input
                  type="date"
                  value={fechaDevolucion}
                  onChange={(e) => setFechaDevolucion(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowLoanModal(false);
                  setSelectedCopia(null);
                  setSelectedUsuario(null);
                  setFechaDevolucion('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLoan}
                disabled={!selectedUsuario || !fechaDevolucion}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
