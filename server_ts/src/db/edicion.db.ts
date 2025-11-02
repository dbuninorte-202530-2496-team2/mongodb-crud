import { ObjectId, ClientSession, type InsertManyResult, type DeleteResult } from 'mongodb';
import { getDB } from '../config/db';
import type { PaginationDto } from '../dto';

const COLLECTION_NAME = 'edicion';

interface EdicionDoc {
  _id?: ObjectId;
  isbn: string;
  año: Date;
  idioma: string;
  libro_id: ObjectId;
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

  async remove(id: ObjectId): Promise<DeleteResult> {
    const db = getDB();
    return await db.collection<EdicionDoc>(COLLECTION_NAME)
      .deleteOne({ _id: id });
  }
};