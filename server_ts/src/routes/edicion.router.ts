import { Router, type Response, type NextFunction } from 'express';
import { ObjectId, MongoServerError } from 'mongodb';
import createError from 'http-errors';
import { validationMiddleware, validateObjectIds } from '../middlewares';
import { edicionDB } from '../db/edicion.db';
import { libroDB } from '../db/libro.db';
import type { TypedRequest } from '../interfaces';
import { PaginationDto, ObjectIdDto, CreateEdicionDto, UpdateEdicionDto } from '../dto';

export const edicionRouter = Router();

edicionRouter.get(
    '/',
    validationMiddleware(PaginationDto, 'query'),
    async (req: TypedRequest<any, any, PaginationDto>, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = req.query;
            const ediciones = await edicionDB.getMany(req.query);

            res.json({
                data: ediciones,
                pagination: {
                    limit,
                    offset,
                    count: ediciones.length,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

edicionRouter.get(
    '/:id',
    validationMiddleware(ObjectIdDto, 'params'),
    async (req: TypedRequest<ObjectIdDto>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const edicion = await edicionDB.getOneById(new ObjectId(id));

            if (!edicion) {
                return next(createError(404, `Edición con id ${id} no encontrada`));
            }

            res.json(edicion);
        } catch (error) {
            next(error);
        }
    }
);

edicionRouter.post(
    '/libro/:libro_id',
    validateObjectIds('params', 'libro_id'),
    validationMiddleware(CreateEdicionDto, 'body'),
    async (req: TypedRequest<any, CreateEdicionDto>, res: Response, next: NextFunction) => {
        try {
            const { libro_id } = req.params;
            const { isbn, año, idioma, numCopias } = req.body;

            const libro = await libroDB.getOneById(new ObjectId(libro_id));
            if (!libro) {
                return next(createError(404, 'Libro no encontrado'));
            }

            const result = await edicionDB.createOne(
                {
                    isbn,
                    año,
                    idioma,
                    libro_id: new ObjectId(libro_id)
                },
                numCopias
            );

            res.status(201).json(result);
        } catch (error) {
            if (error instanceof MongoServerError && error.code === 11000) {
                return next(createError(409, 'Ya existe una edición con ese ISBN'));
            }
            next(error);
        }
    }
);

edicionRouter.patch(
    '/:id',
    validationMiddleware(ObjectIdDto, 'params'),
    validationMiddleware(UpdateEdicionDto, 'body'),
    async (req: TypedRequest<ObjectIdDto, UpdateEdicionDto>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            //Filtrar updates para eliminar las opcionales que llegan como undefined
            const updates = Object.fromEntries(
                Object.entries(req.body).filter(([_, v]) => v !== undefined)
            );
            console.log(updates)

            const edicion_id = new ObjectId(id);

            const result = await edicionDB.updateOne(edicion_id, updates);

            if (result.matchedCount === 0) {
                return next(createError(404, 'Edición no encontrada'));
            }

            res.status(200).json({ ok: true, message: 'Edición actualizada' });
        } catch (error) {
            if (error instanceof MongoServerError && error.code === 11000) {
                return next(createError(409, 'Ya existe una edición con ese ISBN'));
            }
            next(error);
        }
    }
);

edicionRouter.delete(
    '/:id',
    validationMiddleware(ObjectIdDto, 'params'),
    async (req: TypedRequest<ObjectIdDto>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const edicion_id = new ObjectId(id);

            const edicion = await edicionDB.getOneById(edicion_id);
            if (!edicion) {
                return next(createError(404, 'Edición no encontrada'));
            }

            const isLast = await edicionDB.isLastEdicionOfLibro(edicion.libro_id);
            if (isLast) {
                return next(createError(409, 'No se puede eliminar la última edición de un libro'));
            }

            await edicionDB.removeWithCascade(edicion_id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);