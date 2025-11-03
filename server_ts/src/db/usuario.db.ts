import { ObjectId } from 'mongodb';
import { getClient, getDB } from '../config/db';
import type { PaginationDto } from '../dto';
import { normalizeString } from '../utils/normalizeString';

const COLLECTION_NAME = 'usuario';

export interface UsuarioDoc {
    _id?: ObjectId;
    rut: string;
    nombre: string;
}

interface UsuarioConPrestamosResponse {
    _id: ObjectId;
    rut: string;
    nombre: string;
    prestamos: Array<{
        _id: ObjectId;
        fecha_prestamo: Date;
        fecha_devolucion?: Date;
        copia: {
            _id: ObjectId;
            numero_copia: number;
            edicion: {
                _id: ObjectId;
                isbn: string;
                idioma: string;
                año: Date;
                libro: {
                    _id: ObjectId;
                    titulo: string;
                };
            };
        };
    }>;
}

export const usuarioDB = {
    async create(rut: string, nombre: string): Promise<ObjectId> {
        const db = getDB();

        // Verificar si ya existe el usuario con ese RUT
        const existente = await db.collection<UsuarioDoc>(COLLECTION_NAME)
            .findOne({ rut });

        if (existente)
            throw new Error('Ya existe un usuario con ese RUT');


        const result = await db.collection<UsuarioDoc>(COLLECTION_NAME)
            .insertOne({
                rut,
                nombre: normalizeString(nombre)
            });

        return result.insertedId;
    },

    async getMany(paginationDto: PaginationDto): Promise<UsuarioDoc[]> {
        const db = getDB();
        const { limit = 10, offset = 0 } = paginationDto;

        return await db.collection<UsuarioDoc>(COLLECTION_NAME)
            .find({})
            .limit(limit)
            .skip(offset)
            .toArray();
    },

    async getOneById(id: ObjectId): Promise<UsuarioDoc | null> {
        const db = getDB();
        return await db.collection<UsuarioDoc>(COLLECTION_NAME)
            .findOne({ _id: id });
    },

    async getOneByRut(rut: string): Promise<UsuarioDoc | null> {
        const db = getDB();
        return await db.collection<UsuarioDoc>(COLLECTION_NAME)
            .findOne({ rut });
    },

    async getUsuarioConPrestamos(usuario_id: ObjectId): Promise<UsuarioConPrestamosResponse | null> {
        const db = getDB();

        const result = await db.collection(COLLECTION_NAME)
            .aggregate<UsuarioConPrestamosResponse>([
                { $match: { _id: usuario_id } },

                {
                    $lookup: {
                        from: 'prestamo',
                        localField: '_id',
                        foreignField: 'usuario_id',
                        as: 'prestamos'
                    }
                },

                {
                    $unwind: {
                        path: '$prestamos',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'copia',
                        localField: 'prestamos.copia_id',
                        foreignField: '_id',
                        as: 'prestamos.copia_temp'
                    }
                },

                {
                    $unwind: {
                        path: '$prestamos.copia_temp',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'edicion',
                        localField: 'prestamos.copia_temp.edicion_id',
                        foreignField: '_id',
                        as: 'prestamos.edicion_temp'
                    }
                },

                {
                    $unwind: {
                        path: '$prestamos.edicion_temp',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'libro',
                        localField: 'prestamos.edicion_temp.libro_id',
                        foreignField: '_id',
                        as: 'prestamos.libro_temp'
                    }
                },

                {
                    $unwind: {
                        path: '$prestamos.libro_temp',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $group: {
                        _id: '$_id',
                        rut: { $first: '$rut' },
                        nombre: { $first: '$nombre' },
                        prestamos: {
                            $push: {
                                $cond: [
                                    { $ifNull: ['$prestamos._id', false] },
                                    {
                                        _id: '$prestamos._id',
                                        fecha_prestamo: '$prestamos.fecha_prestamo',
                                        fecha_devolucion: '$prestamos.fecha_devolucion',
                                        copia: {
                                            _id: '$prestamos.copia_temp._id',
                                            numero_copia: '$prestamos.copia_temp.numero_copia',
                                            edicion: {
                                                _id: '$prestamos.edicion_temp._id',
                                                isbn: '$prestamos.edicion_temp.isbn',
                                                idioma: '$prestamos.edicion_temp.idioma',
                                                año: '$prestamos.edicion_temp.año',
                                                libro: {
                                                    _id: '$prestamos.libro_temp._id',
                                                    titulo: '$prestamos.libro_temp.titulo'
                                                }
                                            }
                                        }
                                    },
                                    '$$REMOVE'
                                ]
                            }
                        }
                    }
                },

                {
                    $project: {
                        rut: 1,
                        nombre: 1,
                        prestamos: 1
                    }
                }
            ])
            .toArray();

        return result[0] || null;
    },

    async updateOne(id: ObjectId, nombre: string) {
        const db = getDB();
        return await db.collection<UsuarioDoc>(COLLECTION_NAME)
            .updateOne(
                { _id: id },
                { $set: { nombre: normalizeString(nombre) } }
            );
    },

    async canRemoveUsuario(usuarioId: ObjectId): Promise<{ can: boolean; reason?: string }> {
        const db = getDB();

        // Verificar si tiene préstamos activos
        const prestamoActivo = await db.collection('prestamo')
            .findOne({
                usuario_id: usuarioId,
                fecha_devolucion: { $exists: false }
            });

        if (prestamoActivo) {
            return { can: false, reason: 'El usuario tiene préstamos activos' };
        }

        return { can: true };
    },

    async removeUsuario(usuarioId: ObjectId): Promise<void> {
        const db = getDB();
        const client = getClient();
        const session = client.startSession();

        try {
            await session.withTransaction(async () => {
                // 1. Eliminar préstamos históricos (ya devueltos)
                await db.collection('prestamo').deleteMany(
                    {
                        usuario_id: usuarioId,
                        fecha_devolucion: { $exists: true }
                    },
                    { session }
                );

                // 2. Eliminar el usuario
                await db.collection<UsuarioDoc>(COLLECTION_NAME)
                    .deleteOne({ _id: usuarioId }, { session });
            });
        } finally {
            await session.endSession();
        }
    }
};