import { Db, MongoClient } from "mongodb";
import { autorDB } from "../db/autor.db";

let client: MongoClient | null;
let db: Db | null;

export const connectDB = async (): Promise<Db> => {
	if (db) return db;

	try {
		client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
		await client.connect();
		db = client.db(process.env.DB_NAME);
		
		const REQUIRED_COLLECTIONS = [
			"autor", "libro", "edicion", "copia",
			"usuario", "prestamo", "autorea"
		];


		const collections = await db.listCollections().toArray();
		const existingNames = collections.map(c => c.name);

		for (const collectionName of REQUIRED_COLLECTIONS) {
			if (!existingNames.includes(collectionName)) {
				await db.createCollection(collectionName);
			}
		}

		return db;
	} catch (error) {
		throw error;
	}
}

export const getDB = () => {
	if (!db)
		throw new Error("Se intentó acceder a la base de datos sin conectar primero.");

	return db;
}

export const getClient = () => {
	if (!client)
		throw new Error("Se intentó acceder al client antes de conectarlo.");

	return client;
}

export async function initDB() {
	await autorDB.init();
}