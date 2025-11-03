import { Router, type Response, type NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import createError from 'http-errors';
import { validationMiddleware, validateObjectIds } from '../middlewares';
import { copiaDB } from '../db/copia.db';
import { edicionDB } from '../db/edicion.db';
import type { TypedRequest } from '../interfaces';
import { ObjectIdDto, AddCopiasDto } from '../dto';

export const copiaRouter = Router();

copiaRouter.get(
  '/edicion/:edicion_id',
  validateObjectIds('params', 'edicion_id'),
  async (req: TypedRequest<any>, res: Response, next: NextFunction) => {
    try {
      const { edicion_id } = req.params;
      
      const edicion = await edicionDB.getOneById(new ObjectId(edicion_id));
      if (!edicion) {
        return next(createError(404, 'Edición no encontrada'));
      }
      
      const copias = await copiaDB.getByEdicion(new ObjectId(edicion_id));
      res.json({ 
        data: copias, 
        count: copias.length 
      });
    } catch (error) {
      next(error);
    }
  }
);

copiaRouter.get(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: TypedRequest<ObjectIdDto>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const copia = await copiaDB.getOneById(new ObjectId(id));

      if (!copia) {
        return next(createError(404, 'Copia no encontrada'));
      }

      res.json(copia);
    } catch (error) {
      next(error);
    }
  }
);

copiaRouter.post(
  '/edicion/:edicion_id',
  validateObjectIds('params', 'edicion_id'),
  validationMiddleware(AddCopiasDto, 'body'),
  async (req: TypedRequest<any, AddCopiasDto>, res: Response, next: NextFunction) => {
    try {
      const { edicion_id } = req.params;
      const { cantidad } = req.body;
      
      const edicion = await edicionDB.getOneById(new ObjectId(edicion_id));
      if (!edicion) {
        return next(createError(404, 'Edición no encontrada'));
      }
      
      const copiaIds = await copiaDB.addCopiasToEdicion(
        new ObjectId(edicion_id),
        cantidad
      );
      
      res.status(201).json({ 
        message: `${cantidad} copia(s) agregada(s)`,
        copia_ids: copiaIds 
      });
    } catch (error) {
      next(error);
    }
  }
);

copiaRouter.delete(
  '/:id',
  validationMiddleware(ObjectIdDto, 'params'),
  async (req: TypedRequest<ObjectIdDto>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const copia_id = new ObjectId(id);
      
      const validation = await copiaDB.canRemoveCopia(copia_id);
      
      if (!validation.can) {
        return next(createError(409, validation.reason || 'unknown reason'));
      }
      
      await copiaDB.removeCopia(copia_id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);