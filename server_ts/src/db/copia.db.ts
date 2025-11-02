import { ObjectId, ClientSession, type InsertManyResult, type DeleteResult } from 'mongodb';
import { getDB } from '../config/db';
import type { PaginationDto } from '../dto';

const COLLECTION_NAME = 'copia';

interface CopiaDoc {
  _id?: ObjectId;
  edicion_id: ObjectId;
  numero_copia: number;
}

export const copiaDB = {
  async createMany(
    docs: CopiaDoc[], 
    session?: ClientSession
  ): Promise<InsertManyResult<CopiaDoc>> {
    const db = getDB();
    return await db.collection<CopiaDoc>(COLLECTION_NAME)
      .insertMany(docs, { session });
  },

  async getMany(paginationDto: PaginationDto): Promise<CopiaDoc[]> {
    const db = getDB();
    const { limit = 10, offset = 0 } = paginationDto;
    
    return await db.collection<CopiaDoc>(COLLECTION_NAME)
      .find({})
      .limit(limit)
      .skip(offset)
      .toArray();
  },

  async getOne(edicion_id: ObjectId, numero_copia: number): Promise<CopiaDoc | null> {
    const db = getDB();
    return await db.collection<CopiaDoc>(COLLECTION_NAME)
      .findOne({ edicion_id, numero_copia });
  },

  async remove(edicion_id: ObjectId, numero_copia: number): Promise<DeleteResult> {
    const db = getDB();
    return await db.collection<CopiaDoc>(COLLECTION_NAME)
      .deleteOne({ edicion_id, numero_copia });
  },

  async getOneById(id: ObjectId): Promise<CopiaDoc | null> {
    const db = getDB();
    return await db.collection<CopiaDoc>(COLLECTION_NAME)
      .findOne({ _id: id });
  }
};