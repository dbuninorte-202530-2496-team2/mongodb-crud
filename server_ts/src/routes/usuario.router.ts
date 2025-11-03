import { Router, type Response, type NextFunction, type Request } from 'express';
import { ObjectId } from 'mongodb';
import createError from 'http-errors';
import { validationMiddleware } from '../middlewares';
import { usuarioDB } from '../db/usuario.db';
import { PaginationDto, ObjectIdDto, CreateUsuarioDto, UpdateUsuarioDto } from '../dto';
import type { RequestWithValidatedBody, RequestWithValidatedParams, RequestWithValidatedQuery } from '../interfaces';

export const usuarioRouter = Router();

/** 
 * EP to get all usuarios
 * This EP receives pagination info in the query
 */
usuarioRouter.get(
  '/',
  validationMiddleware(PaginationDto, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedQuery<PaginationDto>;
      const { limit = 10, offset = 0 } = typedReq.validatedQuery;
      const usuarios = await usuarioDB.getMany({ limit, offset });

      res.json({
        data: usuarios,
        pagination: { limit, offset, count: usuarios.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * EP to get a usuario by id
 * This EP receives the usuario id as param
 */
usuarioRouter.get(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
      const { id } = typedReq.validatedParams;
      const usuario = await usuarioDB.getOneById(new ObjectId(id));

      if (!usuario) {
        return next(createError(404, `Usuario con id ${id} no encontrado`));
      }

      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * EP to get a usuario with all their prestamos
 * This EP receives the usuario id as param
 */
usuarioRouter.get(
  '/:id/prestamos',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
      const { id } = typedReq.validatedParams;
      const usuario = await usuarioDB.getUsuarioConPrestamos(new ObjectId(id));

      if (!usuario) {
        return next(createError(404, `Usuario con id ${id} no encontrado`));
      }

      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }
);

/** 
 * EP to create a new usuario
 * This EP receives the usuario details in the body
 */
usuarioRouter.post(
  '/',
  validationMiddleware(CreateUsuarioDto, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedBody<CreateUsuarioDto>;
      const { rut, nombre } = typedReq.validatedBody;
      
      const insertedId = await usuarioDB.create(rut, nombre);

      res.status(201).json({ 
        _id: insertedId,
        rut,
        nombre 
      });
    } catch (error) {
      // Si el error es por RUT duplicado, retornar 409 Conflict
      if (error instanceof Error && error.message.includes('Ya existe un usuario con ese RUT')) {
        return next(createError(409, error.message));
      }
      next(error);
    }
  }
);

/**
 * EP to update usuario nombre
 * This EP receives the usuario id as param and the new nombre in the body
 */
usuarioRouter.patch(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  validationMiddleware(UpdateUsuarioDto, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
      const { id } = typedReq.validatedParams;

      const bodyReq = req as RequestWithValidatedBody<UpdateUsuarioDto>;
      const { nombre } = bodyReq.validatedBody;

      const usuario_id = new ObjectId(id);
      const result = await usuarioDB.updateOne(usuario_id, nombre);

      if (result.matchedCount === 0) {
        return next(createError(404, 'Usuario no encontrado.'));
      }

      res.status(200).json({ ok: true, message: 'Nombre actualizado.' });
    } catch (error) {
      next(error);
    }
  }
);

/** 
 * EP to delete a usuario
 * This EP receives the usuario id as param
 * The usuario can only be deleted if they have no active prestamos
 */
usuarioRouter.delete(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
      const { id } = typedReq.validatedParams;
      const usuario_id = new ObjectId(id);

      const usuario = await usuarioDB.getOneById(usuario_id);
      if (!usuario) {
        return next(createError(404, `Usuario con id ${id} no encontrado`));
      }

      // Verificar si se puede eliminar
      const canRemove = await usuarioDB.canRemoveUsuario(usuario_id);
      if (!canRemove.can) {
        return next(createError(400, canRemove.reason || 'No se puede eliminar el usuario'));
      }

      await usuarioDB.removeUsuario(usuario_id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);