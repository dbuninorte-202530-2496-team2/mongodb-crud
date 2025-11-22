import { useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


import { AutoresSelector } from '../components/autor/AutoresSelector';
import { EdicionForm } from '../components/edicion/EdicionForm';
import { CreateEdicionDto } from '../types/dto/edicion.dto';
import { api } from '../api/api';
import { toast } from 'sonner';

export function CreateBookPage() {
    const navigate = useNavigate();
    const [selectedAutores, setSelectedAutores] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        titulo: '',
    });

    const [edicionData, setEdicionData] = useState<CreateEdicionDto>({
        isbn: '',
        idioma: 'español',
        año: `${new Date().getFullYear()}`,
        numCopias: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const loadingId = toast.loading('Creando libro...');
        try {
            const detalleLibro = {
                titulo: formData.titulo,
                autores: selectedAutores,
                ediciones: [edicionData],
            };

            await api.createLibro(detalleLibro);
            toast.success('Libro creado exitosamente');
            
            navigate('/');
        } catch (error) {
            console.error('Error creating book:', error);
            toast.error('No se pudo crear el libro');
        } finally {
            toast.dismiss(loadingId)
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver al catálogo</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Nuevo Libro</h1>
                            <p className="text-sm text-gray-600">Agregar un nuevo libro al catálogo</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Título */}
                        <div>
                            <label className="text-lg font-semibold text-gray-900 mb-4">
                                Título del Libro *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Autores */}
                        <AutoresSelector
                            selectedAutores={selectedAutores}
                            onChange={setSelectedAutores}
                        />

                        {/* Primera Edición */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Primera Edición
                            </h3>

                            <EdicionForm
                                edicionData={edicionData}
                                onChange={setEdicionData}
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={selectedAutores.length === 0}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Crear Libro
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}