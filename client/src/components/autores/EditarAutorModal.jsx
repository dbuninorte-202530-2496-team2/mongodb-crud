import { useState, useEffect } from "react";
import axios from "axios";
import CRUDForm from "../CRUDForm";

export default function EditarAutorModal({ isOpen, onClose, onRefresh, autor }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  // Cuando se abre el modal, cargar los datos del autor seleccionado
  useEffect(() => {
    if (autor) {
      setFormData({ name: autor.name });
    }
  }, [autor]);

  if (!isOpen || !autor) return null;

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/autores/${autor.id}`, data);

      // Mapear correctamente si el backend devuelve otro nombre
      const autorActualizado = { id: res.data.id, name: res.data.name || res.data.nombre };

      onRefresh?.(autorActualizado); // actualiza la lista localmente
      onClose(); // cerrar modal
      alert("Autor actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error actualizando autor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
          Editar Autor
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Guardando cambios...</p>
        ) : (
          <CRUDForm
            entity="autor"
            fields={[{ name: "name", label: "Nombre del Autor", type: "text", required: true }]}
            onSubmit={handleSubmit}
            defaultValues={formData}
          />
        )}
      </div>
    </div>
  );
}
