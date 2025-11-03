import express from 'express';
import { libroRouter } from './libro.router';
import { autorRouter } from './autor.router';
import { edicionRouter } from './edicion.router';
import { copiaRouter } from './copia.router';
import { usuarioRouter } from './usuario.router';
import { prestamoRouter } from './prestamo.router';

const appRouter = express.Router();

appRouter.get('/', (req, res) => {
    res.send('MongoDB CRUD (biblioteca)')
})

appRouter.use('/libros', libroRouter);
appRouter.use('/autores', autorRouter);
appRouter.use('/ediciones', edicionRouter);
appRouter.use('/copias', copiaRouter)
appRouter.use('/usuarios', usuarioRouter);
appRouter.use('/prestamos', prestamoRouter);

export default appRouter;