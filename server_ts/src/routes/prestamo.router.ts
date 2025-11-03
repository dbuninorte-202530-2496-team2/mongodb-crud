import { Router, type Response, type NextFunction, type Request } from 'express';
import { validationMiddleware } from "../middlewares";
import { ObjectIdDto, PaginationDto } from "../dto";
import type { RequestWithValidatedBody, RequestWithValidatedParams, RequestWithValidatedQuery } from "../interfaces";
import { prestamoDB, type PrestamoDoc } from '../db';
import createError from 'http-errors';
import { ObjectId } from 'mongodb';
import { CreatePrestamoDto } from '../dto/models/crearPrestamo.dto';
import { getDB } from '../config/db';
import type { UsuarioDoc } from '../db/usuario.db';
import type { CopiaDoc } from '../db/copia.db';
import { UpdatePrestamoDto } from '../dto/models/actualizarPrestamo.dto';

export const prestamoRouter = Router();

const COLLECTION_NAME_USUARIO = 'usuario';
const COLLECTION_NAME_COPIA = 'copia';

/**
 * EP to get all prestamos with pagination
 */
prestamoRouter.get(
    '/',
    validationMiddleware(PaginationDto, 'query'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedQuery<PaginationDto>;
            const { limit = 10, offset = 0 } = typedReq.validatedQuery;
            const prestamos = await prestamoDB.getMany({ limit, offset });

            res.json({
                data: prestamos,
                pagination: { limit, offset, count: prestamos.length },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * EP to get a prestamo by id
 */
prestamoRouter.get(
    '/:id',
    validationMiddleware(ObjectIdDto, 'params'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
            const { id } = typedReq.validatedParams;
            const prestamo = await prestamoDB.getOneById(new ObjectId(id));

            if (!prestamo) {
                return next(createError(404, `Prestamo con id ${id} no encontrado`));
            }

            res.json(prestamo);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * EP to create a new prestamo
 */
prestamoRouter.post(
    '/',
    validationMiddleware(CreatePrestamoDto, 'body'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedBody<CreatePrestamoDto>;
            const { usuario_id, copia_id, fecha_prestamo, fecha_devolucion } = typedReq.validatedBody;

            const db = getDB();
            
            // Verificar si existe el usuario
            const usuario_encontrado = await db.collection<UsuarioDoc>(COLLECTION_NAME_USUARIO)
                .findOne({ _id: new ObjectId(usuario_id) });

            if (!usuario_encontrado)
                return next(createError(404, 'No existe un usuario con ese ID'));

            // Verificar si existe la copia
            const copia_encontrada = await db.collection<CopiaDoc>(COLLECTION_NAME_COPIA)
                .findOne({ _id: new ObjectId(copia_id) });
            
            if (!copia_encontrada)
                return next(createError(404, 'No existe una copia con ese ID'));

            // Verificar si la copia ya está prestada
            const prestamoActivo = await db.collection<PrestamoDoc>('prestamo')
                .findOne({ 
                    copia_id: new ObjectId(copia_id),
                    fecha_devolucion: { $exists: false }
                });

            if (prestamoActivo)
                return next(createError(400, 'Esta copia ya está prestada'));

            // Crear el préstamo
            const nuevoPrestamo: Omit<PrestamoDoc, '_id'> = {
                usuario_id: new ObjectId(usuario_id),
                copia_id: new ObjectId(copia_id),
                fecha_prestamo: new Date(fecha_prestamo),
            };

            if (fecha_devolucion) {
                nuevoPrestamo.fecha_devolucion = new Date(fecha_devolucion);
            }

            const prestamoId = await prestamoDB.create(nuevoPrestamo);
            const prestamoCreado = await prestamoDB.getOneById(prestamoId);

            res.status(201).json(prestamoCreado);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * EP to update a prestamo by id
 * SOLO permite actualizar fechas
 */
prestamoRouter.patch(
    '/:id',
    validationMiddleware(ObjectIdDto, 'params'),
    validationMiddleware(UpdatePrestamoDto, 'body'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedParams<ObjectIdDto> & RequestWithValidatedBody<UpdatePrestamoDto>;
            const { id } = typedReq.validatedParams;
            const { fecha_prestamo, fecha_devolucion } = typedReq.validatedBody;

            // Verificar que el préstamo existe
            const prestamoExistente = await prestamoDB.getOneById(new ObjectId(id));
            if (!prestamoExistente) {
                return next(createError(404, `Prestamo con id ${id} no encontrado`));
            }

            const prestamoActualizado: Partial<Omit<PrestamoDoc, '_id' | 'usuario_id' | 'copia_id'>> = {};

            // Solo actualizar fechas
            if (fecha_prestamo) {
                prestamoActualizado.fecha_prestamo = new Date(fecha_prestamo);
            }

            if (fecha_devolucion) {
                prestamoActualizado.fecha_devolucion = new Date(fecha_devolucion);
            }

            // Verificar que hay algo que actualizar
            if (Object.keys(prestamoActualizado).length === 0) {
                return next(createError(400, 'No se proporcionaron campos para actualizar'));
            }

            const actualizado = await prestamoDB.update(new ObjectId(id), prestamoActualizado);

            if (!actualizado) {
                return next(createError(500, 'No se pudo actualizar el préstamo'));
            }

            const prestamoActualizadoCompleto = await prestamoDB.getOneById(new ObjectId(id));
            res.json(prestamoActualizadoCompleto);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * EP to delete a prestamo by id
 */
prestamoRouter.delete(
    '/:id',
    validationMiddleware(ObjectIdDto, 'params'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
            const { id } = typedReq.validatedParams;

            // Verificar que el préstamo existe
            const prestamoExistente = await prestamoDB.getOneById(new ObjectId(id));
            if (!prestamoExistente) {
                return next(createError(404, `Prestamo con id ${id} no encontrado`));
            }

            const eliminado = await prestamoDB.delete(new ObjectId(id));

            if (!eliminado) {
                return next(createError(500, 'No se pudo eliminar el préstamo'));
            }

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);