import 'reflect-metadata';
import express, { type Application } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from "./config/db.js";
import type { Server } from "http";
import appRouter from "./routes/api.router.js";

//RELATIVO A LA APLICACIÓN EXPRESS
const app = express();

app.use(cors({
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api', appRouter);


// RELATIVO AL SERVIDOR
const PORT = process.env.PORT || 3000;

let server: Server | null ;

// Apagar
const shutdown = async () => {
	console.log('Apagando servidor...');
	try {
		if (server)
			server.close(() => console.log('Servidor HTTP cerrado.'));
		console.log('Conexión a Neo4j cerrada.');
		process.exit(0);
	} catch (err) {
		console.error('Error al apagar:', err);
		process.exit(1);
	}
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Inicialización
const startServer = async () => {
	try {
		console.log('Conectando a Neo4j...');
		await connectDB();
		console.log('Base de datos lista.');

		// Solo ahora iniciamos el servidor
		server = app.listen(PORT, () => {
			console.log(`Servidor escuchando en http://localhost:${PORT}`);
		});
	} catch (error) {
		if (error instanceof Error){
			console.error(`Error al iniciar servidor: ${error.message}`);
			await shutdown();
		}
	}
};

startServer();