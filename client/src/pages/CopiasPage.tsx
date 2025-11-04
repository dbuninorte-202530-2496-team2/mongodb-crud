import { useEffect, useState } from "react";
import { Book, Calendar, Languages, AlertCircle, CheckCircle, ArrowLeft, BookCopy} from "lucide-react";
import { api } from "../api/api";
import { CopiaDetalle } from "../api/types";
import { PrestamoModal } from "../components/prestamo/PrestamoModal";
import { Navigate, useNavigate } from "react-router-dom";

export function CopiasPage() {
  const [copias, setCopias] = useState<CopiaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCopiaId, setSelectedCopiaId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getCopias();
      setCopias(data);
    } catch (error) {
      console.error("Error cargando copias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopiaClick = (copia: CopiaDetalle) => {
    if (copia.prestamos_activos > 0) {
      alert(`La copia ${copia.numero_copia} no está disponible (ya está prestada).`);
    } else {
      setSelectedCopiaId(copia._id)
    }
  };

  const handleCloseModal = () => setSelectedCopiaId(null);

  const handlePrestamoCreado = async () => {
    // vuelve a cargar copias
    const data = await api.getCopias();
    setCopias(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando copias...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al catálogo</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <BookCopy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Copias</h1>
                <p className="text-sm text-gray-600">Prestamo de Copias</p>
              </div>
            </div>
        </div>
    </div>
      </header>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Copias disponibles</h1>

        {copias.length === 0 ? (
          <p className="text-gray-500">No hay copias registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copias.map((copia) => (
              <div
                key={copia._id}
                onClick={() => handleCopiaClick(copia)}
                className={`bg-white border rounded-xl shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${
                  copia.prestamos_activos > 0 ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Book className="w-6 h-6 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900 capitalize">
                    {copia.edicion.libro.titulo}
                  </h2>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>N° Copia:</strong> {copia.numero_copia}
                  </p>
                  <p>
                    <strong>ISBN:</strong> {copia.edicion.isbn}
                  </p>
                  <p className="flex items-center gap-1 capitalize">
                    <Languages className="w-4 h-4 text-gray-500" />
                    <span>{copia.edicion.idioma}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(copia.edicion.año).getFullYear()}</span>
                  </p>
                  <p className="capitalize">
                    <strong>Autores:</strong>{" "}
                    {copia.edicion.libro.autores.map((a) => a.nombre).join(", ")}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {copia.prestamos_activos > 0 ? (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      No disponible
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Disponible
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedCopiaId && (
        <PrestamoModal
          copiaId={selectedCopiaId}
          onClose={handleCloseModal}
          onPrestamoCreado={handlePrestamoCreado}
        />
      )}
    </div>
  );
}
