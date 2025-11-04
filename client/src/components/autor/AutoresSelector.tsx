import { useEffect, useState } from "react";
import { capitalize } from "../../utils/stringFormatting";
import { X } from "lucide-react";
import { api } from "../../api/api";

interface AutoresSelectorProps {
  selectedAutores: string[];
  onChange: (autores: string[]) => void;
}

export function AutoresSelector({ selectedAutores, onChange }: AutoresSelectorProps) {
  const [autores, setAutores] = useState<string[]>([]);
  const [showNewAutor, setShowNewAutor] = useState(false);
  const [nuevoAutor, setNuevoAutor] = useState('');

  useEffect(() => {
    loadAutores();
  }, []);

  const loadAutores = async () => {
    try {
      const data = await api.getAutores();
      setAutores(data.map((a: any) => a.nombre));
    } catch (error) {
      console.error("Error loading authors:", error);
    }
  };

  const addAutor = (nombre: string) => {
    const trimmed = nombre.trim();
    if (trimmed && !selectedAutores.includes(trimmed)) {
      onChange([...selectedAutores, trimmed]);
    }
  };

  const removeAutor = (nombre: string) => {
    onChange(selectedAutores.filter(a => a !== nombre));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-lg font-semibold text-gray-900 mb-4">
          Autores *
        </label>
        <button
          type="button"
          onClick={() => setShowNewAutor(!showNewAutor)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showNewAutor ? 'Seleccionar existente' : '+ Nuevo autor'}
        </button>
      </div>

      {/* Autores seleccionados */}
      {selectedAutores.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedAutores.map((nombre) => (
            <span
              key={nombre}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {capitalize(nombre)}
              <button
                type="button"
                onClick={() => removeAutor(nombre)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Alternar entre crear nuevo o elegir existente */}
      {showNewAutor ? (
        <div className="border rounded-lg p-3">
          <input
            type="text"
            value={nuevoAutor}
            onChange={(e) => setNuevoAutor(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAutor(nuevoAutor);
                setNuevoAutor("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              addAutor(nuevoAutor);
              setNuevoAutor("");
            }}
            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Agregar
          </button>
        </div>
      ) : (
        <select
          className="w-full px-3 py-2 border rounded-lg"
          onChange={(e) => e.target.value && addAutor(e.target.value)}
        >
          <option value="">Seleccionar autor</option>
          {autores.map((nombre) => (
            <option key={nombre} value={nombre}>
              {capitalize(nombre)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
