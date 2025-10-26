import { normalizeString } from "../utils/normalizeString.js";
import { getClient, getDB } from "./setup.db.js";

const collName = 'autor';
let db;

export const autorDB = {

	async init() {
		db = getDB();
		const collection = db.collection(collName)
		let anon = await collection.findOne({ nombre: 'anonimo' });
		if (!anon)
			await collection.findOne({ nombre: 'anonimo', system: true })
	},

	async createMany(nombres, session) {
		const docs = nombres.map(n => ({
			nombre: normalizeString(n)
		}));

		return await db.collection(collName).insertMany(docs, { session });
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
		const autor = await db.collection(collName).findOne({ _id: id });
		return autor;
	},

	async getManyByNombre(nombres, session) {
		const nombresNormalizados = nombres.map(n =>
			normalizeString(n)
		);

		const autores = await db.collection(collName)
			.find({ nombre: { $in: nombresNormalizados } }, { session })
			.toArray();

		return autores;
	},

	async deleteFromLibro(autor_id, libro_id) {
		const client = getClient();
		const session = client.startSession();

		try {
			await session.withTransaction(async () => {

				const autoreadb = db.collection('autorea');
				const autordb = db.collection('autor');

				/* 
				 * Se asume que la existencia del libro y autor está comprobada
				 * Así como que el controlador valida que el autor no es protegido
				 * por el sistema (por ejemplo, no anonimo)
				 */

				//Eliminar la relación
				await autoreadb.deleteOne({ libro_id, autor_id }, { session })

				//Si el libro ya no tiene autor, relacionarlo con el autor anónimo del sistema
				const tieneAutor = await autoreadb.findOne({ libro_id }, { session });
				if (!tieneAutor) {
					const anonimo = await autordb.findOne(
						{ nombre: 'anonimo', system: true },
						{ session }
					);
					await autoreadb.insertOne(
						{ libro_id, autor_id: anonimo._id },
						{ session }
					);
				}

				//Si el autor ya no tiene más libros, eliminarlo de su tabla
				const sigueAutoreando = await autoreadb.findOne({ autor_id }, { session });
				if (!sigueAutoreando)
					await autordb.deleteOne({ _id: autor_id }, { session })

			})
		} catch (err) {
			throw err;
		} finally {
			await session.endSession();
		}
	}

}
