import express from 'express';

const appRouter = express.Router();

appRouter.get('/', (req, res) => {
	res.send('MongoDB CRUD (Biblioteca)')
})

export default appRouter
