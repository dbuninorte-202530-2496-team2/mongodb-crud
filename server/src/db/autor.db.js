import { getDB } from "./setup.db.js";

const collName = 'autor';
let db;

export const autorDB = {

	init() {
		db = getDB();
	},

	async create(nombre) {
		nombre = this.normalizeNombre(nombre);
		const autor = await db.collection(collName).insertOne({ nombre });
		return autor;
	},

	async createMany(nombres, session) {
		const docs = nombres.map(n => ({
			nombre: this.normalizeNombre(n)
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
			this.normalizeNombre(n)
		);

		const autores = await db.collection(collName)
			.find({ nombre: { $in: nombresNormalizados } }, { session })
			.toArray();

		return autores;
	},

	async remove(id) {
		const result = await db.collection(collName).deleteOne({ _id: id });
		return result;
	},

	normalizeNombre(n) {
		return String(n).trim().replace(/\s+/g, " ").toLowerCase();
	}
}
