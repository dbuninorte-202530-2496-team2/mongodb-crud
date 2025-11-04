import { Router, type Response, type NextFunction, type Request } from 'express';
import { ObjectId } from 'mongodb';
import createError from 'http-errors';
import { validationMiddleware, } from '../middlewares';
import { libroDB } from '../db/libro.db';
import { PaginationDto, ObjectIdDto, DetalleLibroDto, UpdateLibroDto } from '../dto';
import type { RequestWithValidatedBody, RequestWithValidatedParams, RequestWithValidatedQuery } from '../interfaces';


export const libroRouter = Router();

/** 
 * EP to get all libros
 * This EP receives pagination info in the query
 */
libroRouter.get(
  '/',
  validationMiddleware(PaginationDto, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedQuery<PaginationDto>;
      const { limit = 10, offset = 0 } = typedReq.validatedQuery;
      const libros = await libroDB.getManyDetalle({ limit, offset });

      res.json({
        data: libros,
        pagination: { limit, offset, count: libros.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * EP to get a libro by id
 * This EP receives the libro id as param
 */
libroRouter.get(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
      const { id } = typedReq.validatedParams;
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

/** 
 * EP to create a new libro
 * This EP receives the libro details in the body
 */
libroRouter.post(
  '/',
  validationMiddleware(DetalleLibroDto, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedBody<DetalleLibroDto>;
      const createData = typedReq.validatedBody;
      const insertedIds = await libroDB.createFromDetalleLibro(createData);

      res.status(201).json(insertedIds);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * EP to update libro title
 * This EP receives the libro id as param and the new title in the body
 */
libroRouter.patch(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  validationMiddleware(UpdateLibroDto, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
      const { id } = typedReq.validatedParams;

      const bodyReq = req as RequestWithValidatedBody<UpdateLibroDto>;
      const { titulo } = bodyReq.validatedBody;

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

/** 
 * EP to delete a libro
 * This EP receives the libro id as param
 */
libroRouter.delete(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
      const { id } = typedReq.validatedParams;
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
