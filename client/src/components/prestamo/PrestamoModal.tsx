// src/components/PrestamoModal.tsx
import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { Usuario } from "../../api/types";
import { CreatePrestamoDTO } from "../../types/dto/prestamo.dto";

interface PrestamoModalProps {
  copiaId: string;
  onClose: () => void;
  onPrestamoCreado: () => void;
}

export function PrestamoModal({ copiaId, onClose, onPrestamoCreado }: PrestamoModalProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const data = await api.getUsuarios();
        setUsuarios(data);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
        setError("No se pudieron cargar los usuarios.");
      }
    };
    loadUsuarios();
  }, []);

  const handleAsignarPrestamo = async () => {
    if (!usuarioSeleccionado) {
      setError("Por favor selecciona un usuario.");
      return;
    }

    // Prevenir doble click
    if (loading) return;

    setError(null); // Limpiar errores previos
    setLoading(true);

    const data: CreatePrestamoDTO = {
      copia_id: copiaId,
      usuario_id: usuarioSeleccionado,
      fecha_prestamo: new Date().toISOString()
    };

    try {
      await api.createPrestamo(data);
      onPrestamoCreado(); // recarga o actualiza lista
      onClose();          // cierra modal
    } catch (err) {
      console.error("Error creando préstamo:", err);
      setError("No se pudo crear el préstamo. Por favor intenta nuevamente.");
      setLoading(false); // Solo resetear en caso de error
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Asignar préstamo</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <label className="block mb-2 text-gray-700 text-sm font-medium">
          Selecciona un usuario:
        </label>

        <select
          value={usuarioSeleccionado}
          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
          disabled={loading}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">-- Seleccionar usuario --</option>
          {usuarios.map((u) => (
            <option className="capitalize" key={u._id} value={u._id}>
              {u.nombre} ({u.RUT})
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleAsignarPrestamo}
            disabled={loading || !usuarioSeleccionado}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Asignando..." : "Asignar préstamo"}
          </button>
        </div>
      </div>
    </div>
  );
}