import { useState, useEffect } from "react";
import axios from "axios";

export function useAutores() {
  const [autores, setAutores] = useState([]); 
  const [autoresSeleccionados, setAutoresSeleccionados] = useState([]);
  const [autorSeleccionado, setAutorSeleccionado] = useState(null);
  const [autorActualizado, setAutorActualizado] = useState(null);
  

  // Cargar todos los autores desde el backend
  const fetchAutores = async () => {
    try {
      const res = await axios.get("/api/autores");
      setAutores(res.data);
    } catch (err) {
      console.error("Error cargando autores:", err);
    }
  };

  useEffect(() => {
    fetchAutores();
  }, []);

  useEffect(() => {
    if (!autorActualizado) return;

    setAutoresSeleccionados((prev) =>
      prev.map((a) => (a.id === autorActualizado.id ? autorActualizado : a))
    );

    setAutores((prev) =>
      prev.map((a) => (a.id === autorActualizado.id ? autorActualizado : a))
    );

    // Limpiar el trigger
    setAutorActualizado(null);
  }, [autorSeleccionado]);

  // Agregar un nuevo autor localmente
  const handleAutorAgregado = (nuevoAutor) => {
    setAutores((prev) => [...prev, nuevoAutor]);
    setAutoresSeleccionados((prev) => [...prev, nuevoAutor]);
  };

  // Actualizar autor (backend + listas locales)
  const handleAutorActualizado = (autorEditado) => {
    setAutorSeleccionado(autorEditado);
    setAutorActualizado(autorEditado); // trigger para useEffect
  };

  // Quitar autor del libro actual
  const quitarAutor = (id) => {
    setAutoresSeleccionados((prev) => prev.filter((a) => a.id !== id));
    if (autorSeleccionado?.id === id) setAutorSeleccionado(null);
  };

  return {
    autores,
    autoresSeleccionados,
    autorSeleccionado,
    setAutorSeleccionado,
    handleAutorAgregado,
    handleAutorActualizado,
    quitarAutor,
    fetchAutores,
  };
}
