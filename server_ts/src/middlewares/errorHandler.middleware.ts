import type{ Request, Response, NextFunction } from 'express';
import { MongoServerError } from 'mongodb';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(err)

  if (err instanceof MongoServerError) {
    const status = 400;
    let message = err.message || 'Database error';

    // Si es fallo de validación (121), extraemos detalles
    if (err.code === 121 && err.errInfo?.details) {
      const schemaDetails = err.errInfo.details.schemaRulesNotSatisfied || [];
      const fieldErrors: string[] = [];

      for (const rule of schemaDetails) {
        if (rule.propertiesNotSatisfied) {
          for (const prop of rule.propertiesNotSatisfied) {
            const propName = prop.propertyName;
            const reason = prop.details?.[0]?.reason || 'unknown reason';
            fieldErrors.push(`${propName}: ${reason}`);
          }
        }
      }

      if (fieldErrors.length > 0) {
        message = `Validation failed: ${fieldErrors.join(', ')}`;
      }
    }

    return res.status(status).json({
      status,
      message,
      code: err.code,
    });
  }
  
  if (err instanceof Error) {
    const status = (err as any).status || 500;
    
    if (status === 500) {
      console.error(err);
    }
    
    res.status(status).json({
      status,
      message: err.message || 'Internal Server Error',
      code: (err as any).code
    });
    return;
  }
  
  console.error('Unknown error:', err);
  res.status(500).json({
    status: 500,
    message: 'Internal Server Error'
  });
}