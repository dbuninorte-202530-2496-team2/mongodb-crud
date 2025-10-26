export default function AutorList({
  autoresSeleccionados,
  autorSeleccionado,
  setAutorSeleccionado,
  quitarAutor,
}) {
  if (autoresSeleccionados.length === 0) {
    return (
      <p className="text-gray-500 italic mb-3">
        No hay autores asignados a este libro aún.
      </p>
    );
  }

  return (
    <ul className="space-y-2 max-h-24 overflow-y-auto border rounded-md p-3 bg-gray-50">
      {autoresSeleccionados.map((autor) => (
        <li
          key={autor.id}
          onClick={() => setAutorSeleccionado(autor)}
          className={`flex justify-between items-center px-3 py-2 rounded-md cursor-pointer transition ${
            autorSeleccionado?.id === autor.id
              ? "bg-indigo-500 text-white"
              : "bg-white hover:bg-indigo-100"
          }`}
        >
          <span>{autor.name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              quitarAutor(autor.id);
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Quitar
          </button>
        </li>
      ))}
    </ul>
  );
}
