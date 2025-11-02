import express from 'express';
import { libroRouter } from './libro.router';
import { autorRouter } from './autor.router';

const appRouter = express.Router();

appRouter.get('/', (req, res) => {
    res.send('MongoDB CRUD (biblioteca)')
})

appRouter.use('/libros', libroRouter);
appRouter.use('/autores', autorRouter)

export default appRouter;