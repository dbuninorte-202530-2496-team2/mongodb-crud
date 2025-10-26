import { useState } from "react";

export default function CRUDForm({ entity, fields, onSubmit }) {
  // Estado inicial basado en los campos
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

  const [form, setForm] = useState(initialState);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm(initialState);
  };

  return (
    <section className="bg-indigo-50">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-center font-semibold mb-6 capitalize">
              {`Agregar ${entity}`}
            </h2>

            {/* Renderizar dinámicamente los campos */}
            {fields.map((field) => (
              <div className="mb-4" key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-gray-700 font-bold mb-2"
                >
                  {field.label}
                </label>

                {/* Inputs dinámicos según tipo */}
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows="4"
                    className="border rounded w-full py-2 px-3"
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    value={form[field.name]}
                    onChange={handleChange}
                  ></textarea>
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    className="border rounded w-full py-2 px-3"
                    required={field.required}
                    value={form[field.name]}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    className="border rounded w-full py-2 px-3"
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    value={form[field.name]}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}

            <div>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Guardar {entity}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
