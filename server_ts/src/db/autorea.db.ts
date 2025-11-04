import { ObjectId, ClientSession, type InsertManyResult } from 'mongodb';
import { getDB } from '../config/db';
import type { PaginationDto } from '../dto';

const COLLECTION_NAME = 'autorea';

interface AutoreaDoc {
  _id?: ObjectId;
  libro_id: ObjectId;
  autor_id: ObjectId;
}

export const autoreaDB = {
  async createMany(
    docs: AutoreaDoc[], 
    session?: ClientSession
  ): Promise<InsertManyResult<AutoreaDoc>> {
    const db = getDB();
    return await db.collection<AutoreaDoc>(COLLECTION_NAME)
      .insertMany(docs, { session });
  },

  async getMany(paginationDto: PaginationDto): Promise<AutoreaDoc[]> {
    const db = getDB();
    const { limit = 10, offset = 0 } = paginationDto;
    
    return await db.collection<AutoreaDoc>(COLLECTION_NAME)
      .find({})
      .limit(limit)
      .skip(offset)
      .toArray();
  }
};