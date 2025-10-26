import { useState } from "react";
import axios from "axios";
import CRUDForm from "../CRUDForm";

export default function AgregarAutorModal({ isOpen, onClose, onAddAutor }) {
  const [loading, setLoading] = useState(false);

  const autorFields = [
    { name: "name", label: "Nombre del Autor", type: "text", required: true },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/autores", data);

      // Mapear correctamente si tu backend devuelve otro nombre
      const nuevoAutor = { id: res.data.id, name: res.data.name };

      onAddAutor?.(nuevoAutor); // actualiza autoresSeleccionados
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error creando autor");
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
          Agregar Autor
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Guardando autor...</p>
        ) : (
          <CRUDForm entity="autor" fields={autorFields} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}
