import { getDB } from "./setup.db.js";

const collName = 'edicion';
let db;

export const edicionDB = {

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

	async getOneById(id) {
		const edicion = await db.collection(collName).findOne({ _id: id });
		return edicion;
	},

	async remove(id) {
		const result = await db.collection(collName).deleteOne({ _id: id });
		return result;
	},

}
