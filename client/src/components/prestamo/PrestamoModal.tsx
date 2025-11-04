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
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>();
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

    const data: CreatePrestamoDTO = {
      copia_id: copiaId,
      usuario_id: usuarioSeleccionado,
      fecha_prestamo: new Date()
    };

    try {
      setLoading(true);
      await api.createPrestamo(data);
      onPrestamoCreado(); // recarga o actualiza lista
      onClose();          // cierra modal
    } catch (err) {
      console.error("Error creando préstamo:", err);
      setError("No se pudo crear el préstamo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
        
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Asignar préstamo</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <label className="block mb-2 text-gray-700 text-sm font-medium">
          Selecciona un usuario:
        </label>

        <select
          value={usuarioSeleccionado}
          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAsignarPrestamo}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Asignando..." : "Asignar préstamo"}
          </button>
        </div>
      </div>
    </div>
  );
}
