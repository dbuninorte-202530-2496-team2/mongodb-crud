import type { ObjectId } from "mongodb";
import { getDB } from "../config/db";
import type { PaginationDto } from "../dto";

const COLLECTION_NAME = 'prestamo';

export interface PrestamoDoc {
    _id?: ObjectId;
    usuario_id: ObjectId;
    copia_id: ObjectId;
    fecha_prestamo: Date;
    fecha_devolucion: Date;
}


export const prestamoDB = {

    async getMany(paginationDto: PaginationDto): Promise<PrestamoDoc[]> {
        const db = getDB();
        const { limit = 10, offset = 0 } = paginationDto;

        return await db.collection<PrestamoDoc>(COLLECTION_NAME)
            .find({})
            .limit(limit)
            .skip(offset)
            .toArray();
    },

    async getOneById(id: ObjectId): Promise<PrestamoDoc | null> {
        const db = getDB();
        return await db.collection<PrestamoDoc>(COLLECTION_NAME)
            .findOne({ _id: id });
    },

    async create(prestamo: Omit<PrestamoDoc, '_id'>): Promise<ObjectId> {
        const db = getDB();
        const result = await db.collection<PrestamoDoc>(COLLECTION_NAME)
            .insertOne(prestamo as PrestamoDoc);
        return result.insertedId;
    },

    async update(id: ObjectId, prestamo: Partial<Omit<PrestamoDoc, '_id'>>): Promise<boolean> {
        const db = getDB();
        const result = await db.collection<PrestamoDoc>(COLLECTION_NAME)
            .updateOne(
                { _id: id },
                { $set: prestamo }
            );
        return result.modifiedCount > 0;
    },

    async delete(id: ObjectId): Promise<boolean> {
        const db = getDB();
        const result = await db.collection<PrestamoDoc>(COLLECTION_NAME)
            .deleteOne({ _id: id });
        return result.deletedCount > 0;
    }


}