import { Db, MongoClient } from "mongodb";
import { libroDB } from "../db/libro.db";
import { autorDB } from "../db/autor.db";

let client: MongoClient | null;
let db: Db | null;

export async function connectDB() {
	if (db) return db;

	try {
		client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
		await client.connect();
		db = client.db(process.env.DB_NAME);
		console.log(`Conectado a MongoDB: ${process.env.DB_NAME}`);

		//Verificar las colecciones requeridas
		const REQUIRED_COLLECTIONS = [
			"autor",
			"libro",
			"edicion",
			"copia",
			"usuario",
			"prestamo",
			"autorea"
		];
		const collections = await db.listCollections().toArray();
		const existingNames = collections.map(c => c.name);

		const missing = REQUIRED_COLLECTIONS.filter(n => !existingNames.includes(n));

		if (missing.length > 0)
			throw new Error(`Faltan colecciones: ${missing.join(", ")}`);

		return db;
	} catch (e) {
		if (e instanceof Error) throw e;
		throw e;
	}
}

export function getDB() {
	if (!db) {
		throw new Error("Se intentó acceder a la base de datos sin conectar primero.");
	}
	return db;
}

export function getClient() {
	if (!client) {
		throw new Error("Se intentó acceder al client antes de conectarlo.");
	}
	return client;
}

export async function initDB() {
	await autorDB.init();
}