import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export interface TypedRequest<
  TParams extends Record<string, any> = ParamsDictionary,
  TBody = any,
  TQuery = any
> extends Request<TParams & ParamsDictionary, any, TBody, TQuery> {}
