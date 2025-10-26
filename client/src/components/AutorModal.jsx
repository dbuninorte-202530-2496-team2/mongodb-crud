import { useState, useEffect } from "react";
import axios from "axios";
import CRUDForm from "./CRUDForm";

export default function AutorModal({ isOpen, onClose, onRefresh, autores }) {
  const [autor, setAutor] = useState(null);
  const [modo, setModo] = useState("crear");
  const [autorNombre, setAutorNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [autorSeleccionado, setAutorSeleccionado] = useState("");

  const autorFields = [
    { name: "name", label: "Nombre del Autor", type: "text", required: true },
  ];


  const fetchAutor = async (nombre = autorSeleccionado) => {
        if (!nombre) {
            alert("Selecciona un autor para editar");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`/api/autores/${nombre}`);
            setAutor(res.data);
            setModo("editar");
        } catch (error) {
            console.error(error);
            alert("No se encontró un autor con ese nombre");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!autores) return;
            if(autores.length === 0){
                setModo("crear");
                setAutorNombre("");
                setAutor(null);
            }else if (autores.length >= 1){
                setModo("editar");
                setAutorNombre("");
                setAutor(null);
            }
    }, [autores]);

    useEffect(() => {
      // Cuando los autores cambian desde el padre (por ejemplo, tras onRefresh)
      // reseteamos el autor seleccionado y el modo si es necesario.
      if (modo === "editar") {
        setAutorSeleccionado("");
        setAutor(null);
      }
    }, [autores]);

if (!isOpen) return null; //no renderiza si no está abierta

  const handleSubmit = async (data) => {
        try {
            if (modo === "editar" && autorSeleccionado) {
                await axios.put(`/api/autores/${autorSeleccionado}`, data);
            } else {
                await axios.post("/api/autores", data);
            }

            alert("Autor guardado correctamente");
            setAutor(null);
            setAutorSeleccionado("");
            //setModo("crear");
            onRefresh?.();
            //onClose();
        } catch (error) {
            console.error(error);
            alert("Error guardando autor");
        }
    };


  const handleDelete = async (nombre = autorSeleccionado) => {
        if (!nombre) {
            alert("Selecciona un autor para eliminar");
            return;
        }

        if (!window.confirm(`¿Estás seguro de eliminar el autor "${nombre}"?`)) return;

        try {
            await axios.delete(`/api/autores/${nombre}`);
            alert("Autor eliminado correctamente");
            onRefresh?.();
            //onClose();
        } catch (error) {
            console.error(error);
            alert("Error eliminando autor");
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
          {modo === "crear" ? "Crear Autor" : "Editar Autor"}
        </h2>

        {/* Selector de Autores */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 bg-indigo-50 p-3 rounded">
            {modo === "editar" && (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="flex flex-col w-full sm:w-auto">
                    <label className="font-semibold text-gray-700 mb-2">Selecciona el autor a editar:</label>
                    <select
                    value={autorSeleccionado || ""}
                    onChange={(e) => setAutorSeleccionado(e.target.value)}
                    className="border border-gray-400 rounded-md px-2 py-1 w-full sm:w-64"
                    >
                    <option value="">-- Selecciona un autor --</option>
                    {autores.map((a) => (
                        <option key={a.id || a.name} value={a.name}>
                        {a.name}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                    onClick={() => handleDelete(autorSeleccionado)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md"
                    >
                    Eliminar
                    </button>
                </div>
                </div>
            )}
        </div>


        {loading ? (
          <p className="text-center text-gray-600">Cargando autor...</p>
        ) : (
          <CRUDForm
            entity="autor"
            fields={autorFields}
            onSubmit={handleSubmit}
            editingData={modo === "editar" ? autor : null}
          />
        )}
      </div>
    </div>
  );
  
}

