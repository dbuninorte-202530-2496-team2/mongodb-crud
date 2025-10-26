// src/pages/CrearLibroPage.jsx
import { useState } from "react";
import { useAutores } from "../components/autores/useAutores";
import LibroTituloInput from "../components/libro/LibroTituloInput";
import LibroAutoresSection from "../components/libro/LibroAutoresSection";
import axios from "axios";

export default function CrearLibroPage() {
  const {
    autoresSeleccionados,
    autorSeleccionado,
    setAutorSeleccionado,
    handleAutorAgregado,
    handleAutorActualizado,
    quitarAutor,
    fetchAutores,
  } = useAutores();

  const [titulo, setTitulo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo) return alert("Por favor ingresa un título del libro");

    try {
      const res = await axios.post("/api/libros", {
        titulo,
        autores: autoresSeleccionados.map((a) => a.id),
      });

      alert(`Libro "${res.data.titulo}" guardado correctamente`);
      setTitulo("");
    } catch (err) {
      console.error("Error guardando libro:", err);
      alert("Error al guardar el libro");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
        Crear Libro
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 border-gray-200 border max-w-3xl mx-auto">
        {/* Contenido que no debe hacer submit */}
        <LibroTituloInput titulo={titulo} setTitulo={setTitulo} />

        <LibroAutoresSection
          autoresSeleccionados={autoresSeleccionados}
          autorSeleccionado={autorSeleccionado}
          setAutorSeleccionado={setAutorSeleccionado}
          handleAutorAgregado={handleAutorAgregado}
          handleAutorActualizado={handleAutorActualizado}
          quitarAutor={quitarAutor}
          fetchAutores={fetchAutores}
        />


        {/* Solo este form es para enviar el libro */}
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
          >
            Guardar Libro
          </button>
        </form>
      </div>

    </div>
  );
}
