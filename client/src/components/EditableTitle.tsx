import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { capitalize } from "../utils/stringFormatting";

export function EditableTitleField({ titulo, onSave }: { titulo: string; onSave: (value: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(titulo);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (value.trim() === titulo) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(value.trim());
    setSaving(false);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900">{capitalize(titulo)}</h1>
        <button
          onClick={() => setEditing(true)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <Edit2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
        autoFocus
        disabled={saving}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="p-1 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
      >
        <Check className="w-5 h-5 text-green-600" />
      </button>
      <button
        onClick={() => {
          setValue(titulo);
          setEditing(false);
        }}
        disabled={saving}
        className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
      >
        <X className="w-5 h-5 text-red-600" />
      </button>
    </div>
  );
}