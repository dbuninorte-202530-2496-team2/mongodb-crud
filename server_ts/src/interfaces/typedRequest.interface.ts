import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export interface TypedRequest<
  TParams extends Record<string, any> = ParamsDictionary,
  TBody = any,
  TQuery = any
> extends Request<TParams & ParamsDictionary, any, TBody, TQuery> {}

/**
 * 
 */
export type ValidationType = 'body' | 'query' | 'params';

/**
 * 
 */
export interface RequestWithValidatedBody<T> extends Request {
  validatedBody: T;
}

/**
 * 
 */
export interface RequestWithValidatedQuery<T> extends Request {
  validatedQuery: T;
}

/**
 * 
 */
export interface RequestWithValidatedParams<T> extends Request {
  validatedParams: T;
}

