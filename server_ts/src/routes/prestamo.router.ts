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

prestamoRouter.get(
    '/',
    validationMiddleware(PaginationDto, 'query'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedQuery<PaginationDto>;
            const { limit = 10, offset = 0 } = typedReq.validatedQuery;
            const usuarios = await prestamoDB.getMany({ limit, offset });

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
prestamoRouter.get(
    '/:id',
    validationMiddleware(ObjectIdDto, 'params'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedParams<ObjectIdDto>;
            const { id } = typedReq.validatedParams;
            const usuario = await prestamoDB.getOneById(new ObjectId(id));

            if (!usuario) {
                return next(createError(404, `Prestamo con id ${id} no encontrado`));
            }

            res.json(usuario);
        } catch (error) {
            next(error);
        }
    }
);


/**
 * EP to create a new prestamo
 * This EP receives usuario_id, copia_id, fecha_prestamo and fecha_devolucion in the body
 */
prestamoRouter.post(
    '/',
    validationMiddleware(CreatePrestamoDto, 'body'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedBody<CreatePrestamoDto>;
            const { rut, numero_copia, fecha_prestamo, fecha_devolucion } = typedReq.validatedBody;


            // Verificar si existe el usuario con ese RUT
            const db = getDB();
            const usuario_encontrado = await db.collection<UsuarioDoc>(COLLECTION_NAME_USUARIO)
                .findOne({ rut });

            if (!usuario_encontrado)
                throw new Error('NO existe este usuario con ese id');

            // Verificar si existe esa copia
            const copia_encontrada = await db.collection<CopiaDoc>(COLLECTION_NAME_COPIA)
                .findOne({ numero_copia });
            if (!copia_encontrada)
                throw new Error('NO existe este numero de copia');

            // Crear el préstamo con referencias a usuario y copia
            const nuevoPrestamo = {
                usuario_id: new ObjectId(usuario_encontrado._id),
                copia_id: new ObjectId(copia_encontrada._id),
                fecha_prestamo: new Date(fecha_prestamo),
                fecha_devolucion: new Date(fecha_devolucion)
            };

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
 * This EP receives the prestamo id as param and the data to update in the body
 */
prestamoRouter.patch(
    '/:id',
    validationMiddleware(ObjectIdDto, 'params'),
    validationMiddleware(UpdatePrestamoDto, 'body'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const typedReq = req as RequestWithValidatedParams<ObjectIdDto> & RequestWithValidatedBody<UpdatePrestamoDto>;
            const { id } = typedReq.validatedParams;
            const { rut, numero_copia, fecha_prestamo, fecha_devolucion } = typedReq.validatedBody;

            // Verificar que el préstamo existe
            const prestamoExistente = await prestamoDB.getOneById(new ObjectId(id));
            if (!prestamoExistente) {
                return next(createError(404, `Prestamo con id ${id} no encontrado`));
            }

            const db = getDB();
            const prestamoActualizado: Partial<Omit<PrestamoDoc, '_id'>> = {};

            // Si se proporciona un nuevo RUT, buscar el usuario
            if (rut) {
                const usuario_encontrado = await db.collection<UsuarioDoc>(COLLECTION_NAME_USUARIO)
                    .findOne({ rut });

                if (!usuario_encontrado) {
                    return next(createError(404, 'No existe un usuario con ese RUT'));
                }
                prestamoActualizado.usuario_id = new ObjectId(usuario_encontrado._id);
            }

            // Si se proporciona un nuevo número de copia, buscar la copia
            if (numero_copia) {
                const copia_encontrada = await db.collection<CopiaDoc>(COLLECTION_NAME_COPIA)
                    .findOne({ numero_copia });

                if (!copia_encontrada) {
                    return next(createError(404, 'No existe una copia con ese número'));
                }
                prestamoActualizado.copia_id = new ObjectId(copia_encontrada._id);
            }

            // Actualizar fechas si se proporcionan
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
 * This EP receives the prestamo id as param
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