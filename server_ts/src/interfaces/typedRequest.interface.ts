import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export interface TypedRequest<
  TParams extends ParamsDictionary = ParamsDictionary,
  TBody = any,
  TQuery = any
> extends Request<TParams, any, TBody, TQuery> {}
