import express from 'express';
import createError from 'http-errors';
import { ObjectId } from 'mongodb';

import { libroDB } from '../db/libro.db.js';
import { detalleLibroDto, PaginationDto } from '../dto/index.js';
import { objectIdDto } from '../dto/common/objectId.dto.js';

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

		const insertedIds = await libroDB.createFromDetalleLibro(value);

		res.status(201).json(insertedIds);
	} catch (error) {
		next(error);
	}
});

libroRouter.patch('/:id', async (req, res, next) => {
	try {
		const { error, value } = objectIdDto.validate(req.params.id);
		if (error) return next(createError(400, error.message));

		const libro_id = new ObjectId(value);
		const { titulo } = req.body;

		if (!titulo) return next(createError(400, 'Campo "titulo" requerido.'));

		const result = await libroDB.updateOne(libro_id, titulo);

		if (result.matchedCount === 0)
			return next(createError(404, 'Libro no encontrado.'));

		res.status(200).json({ ok: true, message: 'Título actualizado.' });
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
