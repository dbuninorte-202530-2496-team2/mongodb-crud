import { ObjectId, ClientSession, type InsertManyResult } from 'mongodb';
import { getClient, getDB } from '../config/db';
import type { DetalleLibroDto, PaginationDto } from '../dto';
import { normalizeString } from '../utils/normalizeString';
import { autorDB } from './autor.db';
import { autoreaDB } from './autorea.db';
import { edicionDB } from './edicion.db';
import { copiaDB } from './copia.db';

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

interface LibroDetalleResponse {
  _id: ObjectId;
  titulo: string;
  autores: Array<{
    _id: ObjectId;
    nombre: string;
  }>;
  ediciones: Array<{
    _id: ObjectId;
    isbn: string;
    idioma: string;
    año: Date;
    copias: Array<{
      _id: ObjectId;
      numero_copia: number;
    }>;
  }>;
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
        ...existentes.map(a => a._id!),
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
    const { limit = 10, offset = 0 } = paginationDto;

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

  async getManyDetalle(paginationDto: PaginationDto): Promise<LibroDetalleResponse[]> {
    const db = getDB();
    const { limit = 10, offset = 0 } = paginationDto;

    return await db.collection(COLLECTION_NAME)
      .aggregate<LibroDetalleResponse>([
        { $skip: offset },
        { $limit: limit },

        {
          $lookup: {
            from: 'autorea',
            localField: '_id',
            foreignField: 'libro_id',
            as: 'autorea_relations'
          }
        },

        {
          $lookup: {
            from: 'autor',
            localField: 'autorea_relations.autor_id',
            foreignField: '_id',
            as: 'autores'
          }
        },

        {
          $lookup: {
            from: 'edicion',
            localField: '_id',
            foreignField: 'libro_id',
            as: 'ediciones'
          }
        },

        {
          $lookup: {
            from: 'copia',
            localField: 'ediciones._id',
            foreignField: 'edicion_id',
            as: 'copias_temp'
          }
        },

        {
          $addFields: {
            ediciones: {
              $map: {
                input: '$ediciones',
                as: 'edicion',
                in: {
                  _id: '$$edicion._id',
                  isbn: '$$edicion.isbn',
                  idioma: '$$edicion.idioma',
                  año: '$$edicion.año',
                  copias: {
                    $filter: {
                      input: '$copias_temp',
                      as: 'copia',
                      cond: { $eq: ['$$copia.edicion_id', '$$edicion._id'] }
                    }
                  }
                }
              }
            }
          }
        },

        {
          $project: {
            titulo: 1,
            autores: {
              _id: 1,
              nombre: 1
            },
            ediciones: {
              _id: 1,
              isbn: 1,
              idioma: 1,
              año: 1,
              copias: {
                _id: 1,
                numero_copia: 1
              }
            }
          }
        }
      ])
      .toArray();
  },

  async getDetalleById(id: ObjectId): Promise<LibroDetalleResponse | null> {
    const db = getDB();

    const result = await db.collection(COLLECTION_NAME)
      .aggregate<LibroDetalleResponse>([
        { $match: { _id: id } },

        {
          $lookup: {
            from: 'autorea',
            localField: '_id',
            foreignField: 'libro_id',
            as: 'autorea_relations'
          }
        },

        {
          $lookup: {
            from: 'autor',
            localField: 'autorea_relations.autor_id',
            foreignField: '_id',
            as: 'autores'
          }
        },

        {
          $lookup: {
            from: 'edicion',
            localField: '_id',
            foreignField: 'libro_id',
            as: 'ediciones'
          }
        },

        {
          $lookup: {
            from: 'copia',
            localField: 'ediciones._id',
            foreignField: 'edicion_id',
            as: 'copias_temp'
          }
        },

        {
          $addFields: {
            ediciones: {
              $map: {
                input: '$ediciones',
                as: 'edicion',
                in: {
                  _id: '$$edicion._id',
                  isbn: '$$edicion.isbn',
                  idioma: '$$edicion.idioma',
                  año: '$$edicion.año',
                  copias: {
                    $filter: {
                      input: '$copias_temp',
                      as: 'copia',
                      cond: { $eq: ['$$copia.edicion_id', '$$edicion._id'] }
                    }
                  }
                }
              }
            }
          }
        },

        {
          $project: {
            titulo: 1,
            autores: {
              _id: 1,
              nombre: 1
            },
            ediciones: {
              _id: 1,
              isbn: 1,
              idioma: 1,
              año: 1,
              copias: {
                _id: 1,
                numero_copia: 1
              }
            }
          }
        }
      ])
      .toArray();

    return result[0] || null;
  },

  async updateOne(id: ObjectId, titulo: string) {
    const db = getDB();
    return await db.collection<LibroDoc>(COLLECTION_NAME)
      .updateOne({ _id: id }, { $set: { titulo: normalizeString(titulo) } });
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