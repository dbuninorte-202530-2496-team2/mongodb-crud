import { ObjectId, ClientSession, type InsertManyResult, type DeleteResult, type UpdateResult } from 'mongodb';
import { getClient, getDB } from '../config/db';
import type { PaginationDto } from '../dto';

const COLLECTION_NAME = 'edicion';

interface EdicionDoc {
  _id?: ObjectId;
  isbn: string;
  año: Date;
  idioma: string;
  libro_id: ObjectId;
}

interface CopiaDoc {
  _id?: ObjectId;
  edicion_id: ObjectId;
  numero_copia: number;
}

export const edicionDB = {
  async createMany(
    docs: EdicionDoc[], 
    session?: ClientSession
  ): Promise<InsertManyResult<EdicionDoc>> {
    const db = getDB();
    return await db.collection<EdicionDoc>(COLLECTION_NAME)
      .insertMany(docs, { session });
  },

  async createOne(
    edicionData: Omit<EdicionDoc, '_id'>,
    numCopias: number
  ): Promise<{ edicion_id: ObjectId; copia_ids: ObjectId[] }> {
    const db = getDB();
    const client = getClient();
    const session = client.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Crear edición
        const edicionResult = await db.collection<EdicionDoc>(COLLECTION_NAME)
          .insertOne(edicionData, { session });

        const edicion_id = edicionResult.insertedId;

        // 2. Crear copias
        const copias: CopiaDoc[] = Array.from({ length: numCopias }, (_, index) => ({
          edicion_id,
          numero_copia: index + 1
        }));

        const copiasResult = await db.collection<CopiaDoc>('copia')
          .insertMany(copias, { session });

        return {
          edicion_id,
          copia_ids: Object.values(copiasResult.insertedIds) as ObjectId[]
        };
      });
    } finally {
      await session.endSession();
    }
  },

  async getMany(paginationDto: PaginationDto): Promise<EdicionDoc[]> {
    const db = getDB();
    const { limit = 10, offset = 0 } = paginationDto;
    
    return await db.collection<EdicionDoc>(COLLECTION_NAME)
      .find({})
      .limit(limit)
      .skip(offset)
      .toArray();
  },

  async getOneById(id: ObjectId): Promise<EdicionDoc | null> {
    const db = getDB();
    return await db.collection<EdicionDoc>(COLLECTION_NAME)
      .findOne({ _id: id });
  },

  async updateOne(
    id: ObjectId,
    updates: Partial<Pick<EdicionDoc, 'isbn' | 'año' | 'idioma'>>
  ): Promise<UpdateResult> {
    const db = getDB();
    return await db.collection<EdicionDoc>(COLLECTION_NAME)
      .updateOne({ _id: id }, { $set: updates });
  },

  async isLastEdicionOfLibro(libro_id: ObjectId): Promise<boolean> {
    const db = getDB();
    const count = await db.collection<EdicionDoc>(COLLECTION_NAME)
      .countDocuments({ libro_id: libro_id });

    return count === 1;
  },

  async removeWithCascade(id: ObjectId): Promise<void> {
    const db = getDB();
    const client = getClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Obtener copias de esta edición
        const copias = await db.collection<CopiaDoc>('copia')
          .find({ edicion_id: id }, { session })
          .toArray();

        const copiaIds = copias.map(c => c._id!);

        // 2. Eliminar préstamos de esas copias
        if (copiaIds.length > 0) {
          await db.collection('prestamo').deleteMany(
            { copia_id: { $in: copiaIds } },
            { session }
          );
        }

        // 3. Eliminar copias
        await db.collection('copia').deleteMany(
          { edicion_id: id },
          { session }
        );

        // 4. Eliminar la edición
        await db.collection<EdicionDoc>(COLLECTION_NAME)
          .deleteOne({ _id: id }, { session });
      });
    } finally {
      await session.endSession();
    }
  }
};