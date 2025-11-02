import type { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import createError from 'http-errors';
import { ObjectId } from 'mongodb';

type ValidationType = 'body' | 'query' | 'params';

export function validationMiddleware(DtoClass: any, source: ValidationType = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      const data = req[source];
      if (!data) {
        return next(createError(400, `${source} cannot be empty`));
      }

      const dtoInstance = plainToInstance(DtoClass, data || {});
      const errors: ValidationError[] = await validate(dtoInstance);

      if (errors.length > 0) {
        const messages = extractErrorMessages(errors);
        return next(createError(400, messages.join(', ')));
      }

      // Se reemplaza el dato de la request con la instancia validada
      if (source === 'body') {
        req.body = dtoInstance;
      } else {
        Object.defineProperty(req, source, {
          value: dtoInstance,
          writable: true,
          configurable: true
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateObjectIds(
  source: ValidationType = 'params',
  ...fields: string[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];

    for (const field of fields) {
      const value = data[field];

      if (!value) {
        return next(createError(400, `${field} is required`));
      }

      if (!ObjectId.isValid(value)) {
        return next(createError(400, `${field} must be a valid ObjectId`));
      }
    }

    next();
  };
}

function extractErrorMessages(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    // Si tiene constraints directos
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    // Si tiene errores anidados (children)
    if (error.children && error.children.length > 0) {
      messages.push(...extractErrorMessages(error.children));
    }
  }

  return messages;
}