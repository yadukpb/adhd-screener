import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Express 4 doesn't catch rejected promises from async handlers on its own -- wrap every one. */
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
}
