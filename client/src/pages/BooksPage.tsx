import { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, Users } from 'lucide-react';

import { Libro } from '../api/types';
import { BookCard } from '../components/BookCard';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


export default function BooksPage() {
    const [libros, setLibros] = useState<Libro[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        loadLibros();
    }, []);

    const loadLibros = async () => {
        try {
            setLoading(true);
            const data = await api.getLibros();
            setLibros(data);
        } catch (error) {
            toast.error('No se pudieron cargar los libros');
            console.log('Error cargando libros: ', error)
        } finally {
            setLoading(false);
        }
    };

    const filteredLibros = libros.filter(libro => {
        const search = searchTerm.toLowerCase();
        if (libro.titulo.toLowerCase().includes(search)) return true;
        if (libro.autores?.some(a => a.nombre.toLowerCase().includes(search))) return true;

        return false;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Sistema de Biblioteca</h1>
                                <p className="text-sm text-gray-600">Gestión de libros y préstamos</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('users')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            <span>Usuarios</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por título, autor o ISBN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => navigate('create-book')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Nuevo Libro</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Cargando libros...</div>
                    </div>
                ) : filteredLibros.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'No se encontraron libros' : 'No hay libros registrados'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLibros.map((libro) => (
                            <BookCard
                                key={libro._id}
                                libro={libro}
                                onClick={() => navigate('book')}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
