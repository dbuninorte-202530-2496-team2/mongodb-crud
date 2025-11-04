import { Book } from 'lucide-react';
import { Libro } from '../api/types';
import {formatAutores} from '../utils/stringFormatting.ts'
import { capitalize } from '../utils/stringFormatting';

interface BookCardProps {
    libro: Libro;
    onClick: () => void;
}

export function BookCard({ libro, onClick }: BookCardProps) {
    const allCopias = libro.ediciones?.flatMap(e => e.copias) || [];
    const total = allCopias.length;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 border border-gray-200"
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                    <Book className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {capitalize(libro.titulo)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                        {formatAutores(libro.autores)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Ediciones: {libro.ediciones.length}</p>
                    <div className="flex items-center gap-4 mt-3">
                        <span className={`text-sm font-medium ${'text-green-600'}`}>
                            {total} copias
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
