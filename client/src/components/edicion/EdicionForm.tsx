import { CreateEdicionDto } from "../../types/dto/edicion.dto";

interface EdicionFormProps {
  edicionData: CreateEdicionDto;
  onChange: (nuevaEdicion: EdicionFormProps["edicionData"]) => void;
}

export function EdicionForm({ edicionData, onChange }: EdicionFormProps) {
  return (
    <div>

      <div className="space-y-4">
        {/* ISBN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ISBN *
          </label>
          <input
            type="text"
            required
            value={edicionData.isbn}
            onChange={(e) => onChange({ ...edicionData, isbn: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="978-3-16-148410-0"
          />
        </div>

        {/* Idioma + Año */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma *
            </label>
            <select
              required
              value={edicionData.idioma}
              onChange={(e) => onChange({ ...edicionData, idioma: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="español">Español</option>
              <option value="inglés">Inglés</option>
              <option value="francés">Francés</option>
              <option value="alemán">Alemán</option>
              <option value="portugués">Portugués</option>
              <option value="italiano">Italiano</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año *
            </label>
            <input
              type="number"
              required
              min="1000"
              max={new Date().getFullYear() + 30}
              value={edicionData.año || ''}
              onChange={(e) => {
                onChange({
                  ...edicionData,
                  año: e.target.value,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copias *
            </label>
            <input
              type="number"
              required
              min="1"
              value={edicionData.numCopias || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                onChange({
                  ...edicionData,
                  numCopias: isNaN(value) ? 0 : value,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
