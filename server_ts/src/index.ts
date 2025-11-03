import 'reflect-metadata';
import express, { type Application } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, initDB } from "./config/db.js";
import type { Server } from "http";
import appRouter from "./routes/api.router.js";
import createError from 'http-errors';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

dotenv.config();
const app = express();

app.use(cors({
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use('/api', appRouter);

app.use(function(req, res, next) { next(createError(404)); });
app.use(errorHandler)


// RELATIVO AL SERVIDOR
const PORT = process.env.PORT || 3000;

let server: Server | null ;

// Apagar
const shutdown = async () => {
	console.log('Apagando servidor...');
	try {
		if (server)
			server.close(() => console.log('Servidor HTTP cerrado.'));
		console.log('Conexión a MongoDB cerrada.');
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
		console.log('Conectando a MongoDB...');
		await connectDB();
		await initDB();
		console.log('Base de datos lista.');

		server = app.listen(PORT, () => {
			console.log(`Servidor escuchando en http://localhost:${PORT}/api`);
		});
	} catch (error) {
		if (error instanceof Error){
			console.error(`Error al iniciar servidor: ${error.message}`);
			await shutdown();
		}
	}
};

startServer();