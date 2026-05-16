import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { z } from "zod";

type RequestPartSchema<T> = z.ZodType<T>;

export interface RequestValidationSchema<
  TBody = unknown,
  TParams extends ParamsDictionary = ParamsDictionary,
  TQuery = unknown,
> {
  body?: RequestPartSchema<TBody>;
  params?: RequestPartSchema<TParams>;
  query?: RequestPartSchema<TQuery>;
}

export const validateRequest = <
  TBody = unknown,
  TParams extends ParamsDictionary = ParamsDictionary,
  TQuery = unknown,
>(
  schema: RequestValidationSchema<TBody, TParams, TQuery>,
): RequestHandler<TParams, unknown, TBody, TQuery> => {
  return (
    req: Request<TParams, unknown, TBody, TQuery>,
    _res: Response,
    next: NextFunction,
  ): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
