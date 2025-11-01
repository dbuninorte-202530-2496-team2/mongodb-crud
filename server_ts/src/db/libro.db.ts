import { ObjectId, ClientSession, type InsertManyResult } from 'mongodb';
import { getClient, getDB } from '../config/db';
import type { DetalleLibroDto, PaginationDto } from '../dto';
import { normalizeString } from '../utils/normalizeString';


/*
  PENDIENTE: portear al proyecto autor, autorea, edicion, copia...
*/

const COLLECTION_NAME = 'libro';

interface LibroDoc {
  _id?: ObjectId;
  titulo: string;
}

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

interface AutoreaDoc {
  _id?: ObjectId;
  libro_id: ObjectId;
  autor_id: ObjectId;
}

interface CreateResult {
  libro_id: ObjectId;
  autor_ids: ObjectId[];
  edicion_ids: ObjectId[];
}

export const libroDB = {

  async createFromDetalleLibro(detalleLibro: DetalleLibroDto): Promise<CreateResult> {
    const { titulo, autores, ediciones } = detalleLibro;
    const db = getDB();
    const client = getClient();
    const session = client.startSession();

    try {
      session.startTransaction();

      // 1. LIBRO
      const libroRes = await db.collection<LibroDoc>(COLLECTION_NAME).insertOne(
        { titulo: normalizeString(titulo) },
        { session }
      );
      const libro_id = libroRes.insertedId;

      // 2. AUTORES
      const existentes = await autorDB.getManyByNombre(autores, session);
      const existentesNombre = existentes.map(a => a.nombre);

      const pendientes = autores
        .map(n => normalizeString(n))
        .filter(x => !existentesNombre.includes(x));

      const nuevosRes = pendientes.length > 0
        ? await autorDB.createMany(pendientes, session)
        : null;

      const nuevosIds = nuevosRes 
        ? Object.values(nuevosRes.insertedIds) 
        : [];

      const autorIds: ObjectId[] = [
        ...existentes.map(a => a._id),
        ...nuevosIds
      ];

      // 3. RELACION AUTOREA
      const autoreaDocs: AutoreaDoc[] = autorIds.map(autor_id => ({ 
        libro_id, 
        autor_id 
      }));
      await autoreaDB.createMany(autoreaDocs, session);

      // 4. EDICIONES
      const edicionDocs: EdicionDoc[] = ediciones.map(e => ({
        isbn: e.isbn,
        año: new Date(e.año),
        idioma: e.idioma,
        libro_id,
      }));

      const edicionRes = await edicionDB.createMany(edicionDocs, session);
      const edicionInsertedIds = Object.values(edicionRes.insertedIds) as ObjectId[];

      // 5. COPIAS POR EDICION
      for (let i = 0; i < edicionInsertedIds.length; i++) {
        const edicion_id = edicionInsertedIds[i];
        const numCopias = ediciones[i].numCopias;

        const copias: CopiaDoc[] = Array.from({ length: numCopias }, (_, index) => ({
          edicion_id,
          numero_copia: index + 1
        }));

        await copiaDB.createMany(copias, session);
      }

      await session.commitTransaction();

      return { 
        libro_id, 
        autor_ids: autorIds, 
        edicion_ids: edicionInsertedIds 
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  },

  async getMany(paginationDto: PaginationDto): Promise<LibroDoc[]> {
    const db = getDB();
    const { limit, offset } = paginationDto;
    
    return await db.collection<LibroDoc>(COLLECTION_NAME)
      .find({})
      .limit(limit)
      .skip(offset)
      .toArray();
  },

  async getOneById(id: ObjectId): Promise<LibroDoc | null> {
    const db = getDB();
    return await db.collection<LibroDoc>(COLLECTION_NAME)
      .findOne({ _id: id });
  },

  async updateOne(id: ObjectId, titulo: string) {
    const db = getDB();
    return await db.collection<LibroDoc>(COLLECTION_NAME)
      .updateOne({ _id: id }, { $set: { titulo } });
  },

  async remove(id: ObjectId) {
    const db = getDB();
    return await db.collection<LibroDoc>(COLLECTION_NAME)
      .deleteOne({ _id: id });
  },

  async deleteLibroCascade(libro_id: ObjectId): Promise<{ ok: boolean }> {
    const db = getDB();
    const client = getClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Buscar ediciones del libro
        const ediciones = await db.collection<EdicionDoc>('edicion')
          .find({ libro_id }, { session })
          .toArray();
        const edicionIds = ediciones.map(e => e._id!);

        // 2. Buscar copias de esas ediciones
        const copias = await db.collection<CopiaDoc>('copia')
          .find({ edicion_id: { $in: edicionIds } }, { session })
          .toArray();
        const copiaIds = copias.map(c => c._id!);

        // 3. Eliminar préstamos asociados
        await db.collection('prestamo').deleteMany(
          { copia_id: { $in: copiaIds } }, 
          { session }
        );

        // 4. Eliminar copias
        await db.collection('copia').deleteMany(
          { edicion_id: { $in: edicionIds } }, 
          { session }
        );

        // 5. Eliminar ediciones
        await db.collection('edicion').deleteMany(
          { libro_id }, 
          { session }
        );

        // 6. Buscar autores del libro
        const autoreas = await db.collection<AutoreaDoc>('autorea')
          .find({ libro_id }, { session })
          .toArray();
        const autorIds = autoreas.map(a => a.autor_id);

        // 7. Eliminar relaciones autorea
        await db.collection('autorea').deleteMany(
          { libro_id }, 
          { session }
        );

        // 8. Encontrar autores huérfanos (sin otros libros)
        const autoresConLibros = await db.collection<AutoreaDoc>('autorea')
          .find({ autor_id: { $in: autorIds } }, { session })
          .toArray();

        const autoresVigentesIds = autoresConLibros.map(a => a.autor_id);
        const autoresHuerfanosIds = autorIds.filter(
          aId => !autoresVigentesIds.some(vId => vId.equals(aId))
        );

        // 9. Eliminar autores huérfanos
        if (autoresHuerfanosIds.length > 0) {
          await db.collection('autor').deleteMany(
            { _id: { $in: autoresHuerfanosIds } }, 
            { session }
          );
        }

        // 10. Finalmente, eliminar el libro
        await db.collection('libro').deleteOne(
          { _id: libro_id }, 
          { session }
        );
      });

      return { ok: true };

    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }
};