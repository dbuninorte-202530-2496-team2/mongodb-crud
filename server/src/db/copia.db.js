import { getDB } from "./setup.db.js";

const collName = 'copia';
let db;

export const copiaDB = {

	init() {
		db = getDB();
	},

	async createMany(docs, session) {
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

	async getOne(edicion_id, numero) {
		const copia = await db.collection(collName).findOne({ edicion_id, numero });
		return copia;
	},

	async remove(edicion_id, numero) {
		const result = await db.collection(collName).deleteOne({ edicion_id, numero });
		return result;
	},

}
