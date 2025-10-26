import { autorDB } from "./autor.db.js";
import { autoreaDB } from "./autorea.db.js";
import { copiaDB } from "./copia.db.js";
import { edicionDB } from "./edicion.db.js";
import { getClient, getDB } from "./setup.db.js";

const collName = 'libro';
let db;

export const libroDB = {

	init() {
		db = getDB();
	},

	async createFromDetalleLibro(detalleLibro) {

		const { titulo, autores, ediciones } = detalleLibro;

		const client = getClient();
		const session = client.startSession();
		try {
			session.startTransaction();

			//LIBRO
			const libroRes = await db.collection(collName).insertOne({ titulo }, { session });
			const libro_id = libroRes.insertedId;

			//AUTORES

			//Query de los ya existentes 
			const existentes = await autorDB.getManyByNombre(autores, session)
			const existentesNombre = existentes.map(a => a.nombre)

			//Retirar los nombres existentes del input
			const pendientes = autores
				.map(n => autorDB.normalizeNombre(n))
				.filter(x => !existentesNombre.includes(x))

			//Si alguno es nuevo autor, crearlo
			const nuevosRes = pendientes.length > 0
				? await autorDB.createMany(pendientes, session)
				: [];
			const nuevosIds = Object.values(nuevosRes?.insertedIds ?? {});

			//Juntar todas las ids de autor
			const autorIds = [
				...existentes?.map(a => a._id),
				...nuevosIds];

			//RELACION AUTOREA
			const autoreaDocs = autorIds.map(id => ({ libro_id, autor_id: id }))
			await autoreaDB.createMany(
				autoreaDocs,
				session
			)

			//EDICION
			const edicionDocs = ediciones.map(e => (
				{
					isbn: e.isbn,
					año: new Date(e.año),
					idioma: e.idioma,
					libro_id,
				}
			))
			const edicionRes = await edicionDB.createMany(
				edicionDocs,
				session
			)
			const edicionInsertedIds = Object.values(edicionRes.insertedIds);


			//COPIAS EN CADA EDICION
			for (let i = 0; i < edicionInsertedIds.length; i++) {
				const edicion_id = edicionInsertedIds[i];
				const numCopias = ediciones[i].numCopias;

				const copias = [];
				for (let c = 1; c <= numCopias; c++) {
					copias.push({
						edicion_id,
						numero_copia: c
					});
				}

				await copiaDB.createMany(copias, session);
			}

			await session.commitTransaction();

			return { libro_id, autor_ids: autorIds, edicion_ids: edicionInsertedIds, }
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			await session.endSession();
		}
	},

	async getMany(paginationDto) {
		const { limit, offset } = paginationDto;
		return await db.collection(collName)
			.find({})
			.limit(limit)
			.skip(offset)
			.toArray();
	},

	async getOneById(id) {
		const libro = await db.collection(collName)
			.findOne({ _id: id });
		return libro;
	},

	async remove(id) {
		const result = await db.collection(collName).deleteOne({ _id: id });
		return result;
	},

	async deleteLibroCascade(libro_id) {
		const client = getClient();
		const session = client.startSession();

		try {
			await session.withTransaction(async () => {
				//Buscar los préstamos que referencian el id de libro
				const ediciones = await db.collection('edicion')
					.find({ libro_id }, { session })
					.toArray();
				const edicionIds = ediciones.map(e => e._id);

				//También sus copias
				const copias = await db.collection('copia')
					.find({ edicion_id: { $in: edicionIds } }, { session })
					.toArray();
				const copiaIds = copias.map(c => c._id);

				//Eliminar préstamos
				await db.collection('prestamo').deleteMany({ copia_id: { $in: copiaIds } }, { session });

				//Copias
				await db.collection('copia').deleteMany({ edicion_id: { $in: edicionIds } }, { session });

				//Ediciones
				await db.collection('edicion').deleteMany({ libro_id }, { session });

				//Antes de "desconectarlos", recordar autores
				const autoresIds = await db.collection('autorea').aggregate([
					{ $match: { libro_id } },
					{
						$lookup: {
							from: 'autor',
							localField: 'autor_id',
							foreignField: '_id',
							as: 'autor'
						}
					},
					{ $unwind: '$autor' },
					{
						$project: {
							_id: 0,
							autor_id: '$autor._id',
						}
					}
				]).toArray();

				//Deshacer relación con sus autores
				await db.collection('autorea').deleteMany({ libro_id }, { session });

				//Autores aún con libros 
				const vigentes = await db.collection('autorea')
					.find({ autor_id: { $in: autoresIds } }, { session })
					.toArray();

				const vigentesIds = vigentes.map(v => v._id)
				const huerfanosIds = autoresIds.filter(aId => !vigentesIds.includes(aId));

				//Eliminar a los autores huérfanos (sin libros)
				await db.collection('autor')
					.deleteMany({ _id: { $in: huerfanosIds } }, { session })

				//Libro
				await db.collection('libro').deleteOne({ _id: libro_id }, { session });
			});

			return { ok: true };

		} catch (err) {
			throw err;
		} finally {
			await session.endSession();
		}
	}

}
