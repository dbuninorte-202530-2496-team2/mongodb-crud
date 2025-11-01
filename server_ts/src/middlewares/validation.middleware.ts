import type { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import createError from 'http-errors';

type ValidationType = 'body' | 'query' | 'params';

export function validationMiddleware(DtoClass: any, source: ValidationType = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToInstance(DtoClass, req[source]);
      const errors: ValidationError[] = await validate(dtoInstance);

      if (errors.length > 0) {
        const messages = errors
          .map(error => Object.values(error.constraints || {}))
          .flat();
        return next(createError(400, messages.join(', ')));
      }

      // NOTA: Se reemplaza el dato de la request con la instancia validada
      req[source] = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
}