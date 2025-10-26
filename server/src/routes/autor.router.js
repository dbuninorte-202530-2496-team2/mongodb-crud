import express from 'express';
import createError from 'http-errors';
import { ObjectId } from 'mongodb';

import { autorDB } from '../db/autor.db';
import { objectIdDto } from '../dto/common/objectId.dto';
import { PaginationDto } from '../dto';
import { libroDB } from '../db/libro.db';
import { libroAndAutorIdsDto } from '../dto/common/twoObjectIdsDto';

const autorRouter = express.Router();

autorRouter.get('/', async (req, res, next) => {
	try {

		const paginationDto = await PaginationDto.validateAsync(
			{
				limit: req.query.limit,
				offset: req.query.offset,
			},
			{ convert: true }
		);

		const autores = await autorDB.getMany(paginationDto);

		res.json({
			data: autores,
			pagination: {
				limit: paginationDto.limit,
				offset: paginationDto.offset,
				count: autores.length
			}
		});
	} catch (error) {
		next(error);
	}
});

autorRouter.get('/:id', async (req, res, next) => {
	try {
		const { error, value } = objectIdDto.validate(req.params.id);
		if (error) return next(createError(400, error.message));

		const autor = await libroDB.getOneById(new ObjectId(value));

		if (!autor)
			return next(createError(404, `Autor con id ${id} no encontrado`));

		res.json(autor);
	} catch (error) {
		next(error);
	}
});

autorRouter.delete('/:autor_id/libro/:libro_id', async (req, res, next) => {
	try {

		const { error, value } = libroAndAutorIdsDto.validate(req.params);
		if (error) return next(createError(400, error.message));

		const { autor_id: aId, libro_id: lId } = value

		const [libro, autor] = await Promise.all([
			libroDB.getOneById(lId),
			autorDB.getOneById(aId)
		])

		if (!libro)
			return next(createError(404, `Libro con id ${lId} no encontrado`));
		if (!autor)
			return next(createError(404, `Autor con id ${aId} no encontrado`));
		if (autor.system)
			return next(createError(403, `Este autor está protegido por el sistema`));

		await autorDB.deleteFromLibro(aId, lId);

		res.status(204).send();
	} catch (err) {
		next(err);
	}
});
