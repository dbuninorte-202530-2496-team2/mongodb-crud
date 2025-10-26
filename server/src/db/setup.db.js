import { MongoClient } from "mongodb";
import { libroDB } from "./libro.db.js";
import { autorDB } from "./autor.db.js";
import { autoreaDB } from "./autorea.db.js";
import { edicionDB } from "./edicion.db.js";
import { copiaDB } from "./copia.db.js";

let client;
let db;

export async function connectDB() {
	if (db) return db;

	try {
		client = new MongoClient(process.env.MONGO_URI);
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

export function initDB() {
	libroDB.init();
	autorDB.init();
	autoreaDB.init();
	edicionDB.init();
	copiaDB.init();
}
