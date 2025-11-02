import { Router, type Response, type NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import createError from 'http-errors';
import { validationMiddleware } from '../middlewares';
import { libroDB } from '../db/libro.db';
import type { TypedRequest } from '../interfaces';
import { PaginationDto, ObjectIdDto, DetalleLibroDto, UpdateLibroDto} from '../dto';


export const libroRouter = Router();


libroRouter.get(
  '/',
  validationMiddleware(PaginationDto, 'query'),
  async (req: TypedRequest<any, any, PaginationDto>, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;
      const libros = await libroDB.getMany(req.query);

      res.json({
        data: libros,
        pagination: {
          limit,
          offset,
          count: libros.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

libroRouter.get(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: TypedRequest<ObjectIdDto>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const libro = await libroDB.getDetalleById(new ObjectId(id));

      if (!libro) {
        return next(createError(404, `Libro con id ${id} no encontrado`));
      }

      res.json(libro);
    } catch (error) {
      next(error);
    }
  }
);

libroRouter.post(
  '/',
  validationMiddleware(DetalleLibroDto, 'body'),
  async (req: TypedRequest<any, DetalleLibroDto>, res: Response, next: NextFunction) => {
    try {
      const insertedIds = await libroDB.createFromDetalleLibro(req.body);

      res.status(201).json(insertedIds);
    } catch (error) {
      next(error);
    }
  }
);

libroRouter.patch(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  validationMiddleware(UpdateLibroDto, 'body'),
  async (req: TypedRequest<ObjectIdDto, UpdateLibroDto>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { titulo } = req.body;

      const libro_id = new ObjectId(id);
      const result = await libroDB.updateOne(libro_id, titulo);

      if (result.matchedCount === 0) {
        return next(createError(404, 'Libro no encontrado.'));
      }

      res.status(200).json({ ok: true, message: 'Título actualizado.' });
    } catch (error) {
      next(error);
    }
  }
);

libroRouter.delete(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: TypedRequest<ObjectIdDto>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const libro_id = new ObjectId(id);

      const libro = await libroDB.getOneById(libro_id);
      if (!libro) {
        return next(createError(404, `Libro con id ${id} no encontrado`));
      }

      await libroDB.deleteLibroCascade(libro_id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);
