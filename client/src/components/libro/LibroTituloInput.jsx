export default function LibroTituloInput({ titulo, setTitulo }) {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-2">
        Título del Libro
      </label>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Ej. Cien Años de Soledad"
        className="border rounded w-full py-2 px-3 focus:outline-none focus:ring focus:ring-indigo-300"
      />
    </div>
  );
}
