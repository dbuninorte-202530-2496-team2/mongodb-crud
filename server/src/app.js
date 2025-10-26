import dotenv from 'dotenv';
dotenv.config(); //Procesar variables de entorno

import express from 'express';
import createError from 'http-errors';

import { connectDB, initDB } from './db/setup.db.js';
import appRouter from './routes/app.router.js';
import libroRouter from './routes/libro.router.js'
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

await connectDB();
initDB();

app.use(express.json())

app.use('/', appRouter)
app.use('/libros', libroRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) { next(createError(404)); });
app.use(errorHandler)


app.listen(process.env.PORT, () => {
	console.log(`CRUD de Mongo escuchando el puerto ${process.env.PORT}...`);
})
