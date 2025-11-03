import { ObjectId, ClientSession, type InsertManyResult, type DeleteResult } from 'mongodb';
import { getClient, getDB } from '../config/db';
import type { PaginationDto } from '../dto';

const COLLECTION_NAME = 'copia';

export interface CopiaDoc {
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

  async addCopiasToEdicion(
    edicion_id: ObjectId,
    cantidad: number
  ): Promise<ObjectId[]> {
    const db = getDB();
    
    // 1. Obtener el número de la última copia existente
    const ultimaCopia = await db.collection<CopiaDoc>(COLLECTION_NAME)
      .find({ edicion_id })
      .sort({ numero_copia: -1 })
      .limit(1)
      .toArray();
    
    const siguienteNumero = ultimaCopia.length > 0 
      ? ultimaCopia[0].numero_copia + 1 
      : 1;
    
    // 2. Crear las nuevas copias
    const nuevasCopias: CopiaDoc[] = Array.from(
      { length: cantidad }, 
      (_, index) => ({
        edicion_id,
        numero_copia: siguienteNumero + index
      })
    );
    
    const result = await db.collection<CopiaDoc>(COLLECTION_NAME)
      .insertMany(nuevasCopias);
    
    return Object.values(result.insertedIds) as ObjectId[];
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

  async getByEdicion(edicion_id: ObjectId): Promise<CopiaDoc[]> {
    const db = getDB();
    return await db.collection<CopiaDoc>(COLLECTION_NAME)
      .find({ edicion_id })
      .sort({ numero_copia: 1 })
      .toArray();
  },

  async getOne(edicion_id: ObjectId, numero_copia: number): Promise<CopiaDoc | null> {
    const db = getDB();
    return await db.collection<CopiaDoc>(COLLECTION_NAME)
      .findOne({ edicion_id, numero_copia });
  },

  async getOneById(id: ObjectId): Promise<CopiaDoc | null> {
    const db = getDB();
    return await db.collection<CopiaDoc>(COLLECTION_NAME)
      .findOne({ _id: id });
  },

  async canRemoveCopia(copia_id: ObjectId): Promise<{ can: boolean; reason?: string }> {
    const db = getDB();
    
    // 1. Verificar si existe la copia
    const copia = await db.collection<CopiaDoc>(COLLECTION_NAME)
      .findOne({ _id: copia_id });
    
    if (!copia) {
      return { can: false, reason: 'Copia no encontrada' };
    }
    
    // 2. Verificar si tiene préstamos activos
    const prestamoActivo = await db.collection('prestamo')
      .findOne({ 
        copia_id, 
        fecha_devolucion: { $exists: false } 
      });
    
    if (prestamoActivo) {
      return { can: false, reason: 'La copia tiene un préstamo activo' };
    }
    
    // 3. Verificar si es la última copia de la edición
    const totalCopias = await db.collection<CopiaDoc>(COLLECTION_NAME)
      .countDocuments({ edicion_id: copia.edicion_id });
    
    if (totalCopias <= 1) {
      return { can: false, reason: 'No se puede eliminar la última copia de una edición' };
    }
    
    return { can: true };
  },

  async removeCopia(copia_id: ObjectId): Promise<void> {
    const db = getDB();
    const client = getClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Eliminar préstamos históricos (ya devueltos)
        await db.collection('prestamo').deleteMany(
          { 
            copia_id,
            fecha_devolucion: { $exists: true }
          },
          { session }
        );
        
        // 2. Eliminar la copia
        await db.collection<CopiaDoc>(COLLECTION_NAME)
          .deleteOne({ _id: copia_id }, { session });
      });
    } finally {
      await session.endSession();
    }
  }
};