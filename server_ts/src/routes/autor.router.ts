import { Router, type Response, type NextFunction } from 'express';
import { MongoServerError, ObjectId } from 'mongodb';
import createError from 'http-errors';
import { validationMiddleware, validateObjectIds } from '../middlewares';
import { autorDB } from '../db/autor.db';
import { libroDB } from '../db/libro.db';
import type { TypedRequest } from '../interfaces'; 
import { PaginationDto, ObjectIdDto } from '../dto';
import { CreateAutorDto, UpdateAutorDto } from '../dto/models/autor.dto';

export const autorRouter = Router();

autorRouter.get(
  '/',
  validationMiddleware(PaginationDto, 'query'),
  async (req: TypedRequest<any, any, PaginationDto>, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;
      const autores = await autorDB.getMany(req.query);

      res.json({
        data: autores,
        pagination: {
          limit,
          offset,
          count: autores.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

autorRouter.get(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: TypedRequest<ObjectIdDto>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const autor = await autorDB.getOneById(new ObjectId(id));

      if (!autor) {
        return next(createError(404, `Autor con id ${id} no encontrado`));
      }

      res.json(autor);
    } catch (error) {
      next(error);
    }
  }
);

autorRouter.post(
  '/libro/:libro_id',
  validateObjectIds('params', 'libro_id'),
  validationMiddleware(CreateAutorDto, 'body'),
  async (req: TypedRequest<ObjectIdDto, CreateAutorDto>, res: Response, next: NextFunction) => {
    try {
      const { libro_id } = req.params;
      const { nombre } = req.body;

      const libro = await libroDB.getOneById(new ObjectId(libro_id));
      if (!libro) {
        return next(createError(404, `Libro con id ${libro_id} no encontrado`));
      }

      const result = await autorDB.createAndLinkToLibro(nombre, new ObjectId(libro_id));

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        return next(createError(409, 'Este autor ya está vinculado a este libro'));
      }
      next(error);
    }
  }
);

autorRouter.patch(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  validationMiddleware(UpdateAutorDto, 'body'),
  async (req: TypedRequest<ObjectIdDto, UpdateAutorDto>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      const autor_id = new ObjectId(id);
      const autor = await autorDB.getOneById(autor_id);

      if (!autor) {
        return next(createError(404, 'Autor no encontrado'));
      }

      if (autor.system) {
        return next(createError(403, 'No se puede modificar un autor del sistema'));
      }

      const result = await autorDB.updateOne(autor_id, nombre);

      if (result.matchedCount === 0) {
        return next(createError(404, 'Autor no encontrado'));
      }

      res.status(200).json({ ok: true, message: 'Nombre de autor actualizado' });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        return next(createError(409, 'Este nombre de autor ya existe'));
      }
      next(error);
    }
  }
);

//Desvincular de un libro
autorRouter.delete(
  '/:autor_id/libro/:libro_id',
  validateObjectIds('params', 'autor_id', 'libro_id'),
  async (req: TypedRequest<any>, res: Response, next: NextFunction) => {
    try {
      const { autor_id, libro_id } = req.params;
      
      const autor_oid = new ObjectId(autor_id);
      const libro_oid = new ObjectId(libro_id);

      const [libro, autor] = await Promise.all([
        libroDB.getOneById(libro_oid),
        autorDB.getOneById(autor_oid)
      ]);

      if (!libro) {
        return next(createError(404, `Libro con id ${libro_id} no encontrado`));
      }

      if (!autor) {
        return next(createError(404, `Autor con id ${autor_id} no encontrado`));
      }

      if (autor.system) {
        return next(createError(403, 'Este autor está protegido por el sistema'));
      }

      await autorDB.deleteFromLibro(autor_oid, libro_oid);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);