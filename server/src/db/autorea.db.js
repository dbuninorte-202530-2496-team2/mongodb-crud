import { getDB } from "./setup.db.js";

const collName = 'autorea';
let db;

export const autoreaDB = {

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

}
