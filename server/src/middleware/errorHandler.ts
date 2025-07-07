// server/src/middleware/errorHandler.ts
import logger from "../utils/logging.js";
import { Request, Response, NextFunction, RequestHandler } from 'express'

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler =>
  (req, res, next) => {
    Promise
      .resolve(fn(req, res, next))
      .catch(next)
  }

// Спеціальний тип для помилки з HTTP-статусом
interface HttpError extends Error {
  status?: number;
}

export default function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Логуємо помилку
  logger.error(err);

  const statusCode = err.status ?? 500;
  const message =
    statusCode === 500
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  res.status(statusCode).json({
    error: {
      message,
      // у development можна віддавати стек
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}

