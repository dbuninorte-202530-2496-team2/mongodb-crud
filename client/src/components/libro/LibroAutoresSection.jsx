import AutorList from "../autores/AutorList";
import AgregarAutorModal from "../autores/AgregarAutorModal";
import EditarAutorModal from "../autores/EditarAutorModal";
import { useState } from "react";

export default function LibroAutoresSection({
  autoresSeleccionados,
  autorSeleccionado,
  setAutorSeleccionado,
  handleAutorAgregado,
  handleAutorActualizado,
  quitarAutor,
}) {
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-indigo-500 mb-3">
        Autores del Libro
      </h2>

      {/* Lista de autores */}
      <AutorList
        autoresSeleccionados={autoresSeleccionados}
        autorSeleccionado={autorSeleccionado}
        setAutorSeleccionado={setAutorSeleccionado}
        quitarAutor={quitarAutor}
      />


      {/* Botones de acción */}
      <div className="flex justify-between items-center mt-4">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Agregar Autor
        </button>

        <button
          type="button"
          disabled={!autorSeleccionado}
          onClick={() => setEditOpen(true)}
          className={`py-2 px-4 rounded font-bold text-white ${
            autorSeleccionado
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          ✏️ Editar / Eliminar Autor
        </button>
      </div>

      {/* Modales */}
      <AgregarAutorModal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        onAddAutor={handleAutorAgregado}
      />

      <EditarAutorModal
        isOpen={isEditOpen}
        onClose={() => setEditOpen(false)}
        onRefresh={handleAutorActualizado}
        autor={autorSeleccionado}
      />
    </div>
  );
}
