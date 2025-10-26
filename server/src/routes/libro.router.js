import express from 'express';
import createError from 'http-errors';

import { libroDB } from '../db/libro.db.js';
import { detalleLibroDto, PaginationDto } from '../dto/index.js';
import { objectIdDto } from '../dto/common/objectId.dto.js';
import { ObjectId } from 'mongodb';

const libroRouter = express.Router();

libroRouter.get('/', async (req, res, next) => {
	try {

		const paginationDto = await PaginationDto.validateAsync(
			{
				limit: req.query.limit,
				offset: req.query.offset,
			},
			{ convert: true }
		);

		const libros = await libroDB.getMany(paginationDto);

		res.json({
			data: libros,
			pagination: {
				limit: paginationDto.limit,
				offset: paginationDto.offset,
				count: libros.length
			}
		});
	} catch (error) {
		next(error);
	}
});

libroRouter.get('/:id', async (req, res, next) => {
	try {
		const { error, value } = objectIdDto.validate(req.params.id);
		if (error) return next(createError(400, error.message));

		const libro = await libroDB.getOneById(new ObjectId(value));

		if (!libro)
			return next(createError(404, `Libro con id ${id} no encontrado`));

		res.json(libro);
	} catch (error) {
		next(error);
	}
});

libroRouter.post('/', async (req, res, next) => {
	try {
		const { error, value } = detalleLibroDto.validate(req.body)
		if (error) return next(createError(400, error.message));

		const libro = await libroDB.createFromDetalleLibro(value);

		res.status(201).json(libro);
	} catch (error) {
		next(error);
	}
});

libroRouter.post('/:id', async (req, res, next) => {
	try {
		const { error, value } = objectIdDto.validate(req.params.id);
		if (error) return next(createError(400, error.message));


	} catch (error) {
		next(error);
	}
})

libroRouter.delete('/:id', async (req, res, next) => {
	try {
		const { error, value } = objectIdDto.validate(req.params.id);
		if (error) return next(createError(400, error.message));

		const libro_id = new ObjectId(value)
		const libro = await libroDB.getOneById(libro_id);
		if (!libro) return next(createError(404, `Libro con id ${value} no encontrado`));

		await libroDB.deleteLibroCascade(libro_id);

		res.status(204).send();
	} catch (error) {
		next(error);
	}
});

export default libroRouter;
