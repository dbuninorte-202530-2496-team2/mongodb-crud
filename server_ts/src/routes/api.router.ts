import express from 'express';
import { libroRouter } from './libro.router';

const appRouter = express.Router();

appRouter.get('/', (req, res) => {
    res.send('MongoDB CRUD (biblioteca)')
})

appRouter.use('/libros', libroRouter);

export default appRouter;