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
    const status = err.code === 11000 ? 400 : 500;
    
    if (status === 500) {
      console.error(err);
    }
    
    res.status(status).json({
      status,
      message: err.message || 'Database error',
      code: err.code
    });
    return;
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