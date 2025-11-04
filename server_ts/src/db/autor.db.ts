import { ObjectId, ClientSession, type InsertManyResult } from 'mongodb';
import { normalizeString } from '../utils/normalizeString';
import { getClient, getDB } from '../config/db';
import type { PaginationDto } from '../dto';

const COLLECTION_NAME = 'autor';

interface AutorDoc {
  _id?: ObjectId;
  nombre: string;
  system?: boolean;
}

interface AutoreaDoc {
  _id?: ObjectId;
  libro_id: ObjectId;
  autor_id: ObjectId;
}

export const autorDB = {
  async init(): Promise<void> {
    const db = getDB();
    const collection = db.collection<AutorDoc>(COLLECTION_NAME);

    const anon = await collection.findOne({ nombre: 'anonimo' });

    if (!anon) {
      await collection.insertOne({ nombre: 'anonimo', system: true });
    }
  },

  async createAndLinkToLibro(nombre: string, libro_id: ObjectId) {
    const db = getDB();
    const client = getClient();
    const session = client.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Verificar si el autor ya existe
        const existente = await db.collection<AutorDoc>(COLLECTION_NAME)
          .findOne({ nombre: normalizeString(nombre) }, { session });

        let autor_id: ObjectId;

        if (existente) {
          autor_id = existente._id;
        } else {
          // 2. Crear el autor
          const result = await db.collection<AutorDoc>(COLLECTION_NAME)
            .insertOne({ nombre: normalizeString(nombre) }, { session });
          autor_id = result.insertedId;
        }

        const anonimo = await db.collection<AutorDoc>(COLLECTION_NAME)
          .findOne({ nombre: 'anonimo' });
        if (anonimo) {
          await db.collection<AutoreaDoc>('autorea').deleteOne(
            { libro_id, autor_id: anonimo._id },
            { session }
          );
        }

        // 3. Crear relación autorea
        await db.collection<AutoreaDoc>('autorea')
          .insertOne({ libro_id, autor_id }, { session });

        return { autor_id, libro_id };
      });
    } finally {
      await session.endSession();
    }
  },

  async createMany(
    nombres: string[],
    session?: ClientSession
  ): Promise<InsertManyResult<AutorDoc>> {
    const db = getDB();
    const docs: AutorDoc[] = nombres.map(n => ({
      nombre: normalizeString(n)
    }));

    return await db.collection<AutorDoc>(COLLECTION_NAME)
      .insertMany(docs, { session });
  },

  async getMany(paginationDto: PaginationDto): Promise<AutorDoc[]> {
    const db = getDB();
    const { limit = 10, offset = 0 } = paginationDto;

    return await db.collection<AutorDoc>(COLLECTION_NAME)
      .find({})
      .limit(limit)
      .skip(offset)
      .toArray();
  },

  async getOneById(id: ObjectId): Promise<AutorDoc | null> {
    const db = getDB();
    return await db.collection<AutorDoc>(COLLECTION_NAME)
      .findOne({ _id: id });
  },

  async getManyByNombre(
    nombres: string[],
    session?: ClientSession
  ): Promise<AutorDoc[]> {
    const db = getDB();
    const nombresNormalizados = nombres.map(n => normalizeString(n));

    return await db.collection<AutorDoc>(COLLECTION_NAME)
      .find(
        { nombre: { $in: nombresNormalizados } },
        { session }
      )
      .toArray();
  },

  async updateOne(id: ObjectId, nombre: string) {
    const db = getDB();
    return await db.collection<AutorDoc>(COLLECTION_NAME)
      .updateOne({ _id: id }, { $set: { nombre: normalizeString(nombre) } });
  },

  async deleteFromLibro(
    autor_id: ObjectId,
    libro_id: ObjectId
  ): Promise<void> {
    const db = getDB();
    const client = getClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const autoreadb = db.collection<AutoreaDoc>('autorea');
        const autordb = db.collection<AutorDoc>(COLLECTION_NAME);

        /* 
         * Se asume que la existencia del libro y autor está comprobada
         * Así como que el controlador valida que el autor no es protegido
         * por el sistema (por ejemplo, no anonimo)
         */

        // Eliminar la relación
        await autoreadb.deleteOne({ libro_id, autor_id }, { session });

        // Si el libro ya no tiene autor, relacionarlo con el autor anónimo del sistema
        const tieneAutor = await autoreadb.findOne({ libro_id }, { session });

        if (!tieneAutor) {
          const anonimo = await autordb.findOne(
            { nombre: 'anonimo', system: true },
            { session }
          );

          if (!anonimo) {
            throw new Error('FATAL: autor anónimo del sistema no encontrado')
          }
          await autoreadb.insertOne(
            { libro_id, autor_id: anonimo._id! },
            { session }
          );

        }

        // Si el autor ya no tiene más libros, eliminarlo de su tabla
        const sigueAutoreando = await autoreadb.findOne({ autor_id }, { session });

        if (!sigueAutoreando) {
          await autordb.deleteOne({ _id: autor_id }, { session });
        }
      });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }
}