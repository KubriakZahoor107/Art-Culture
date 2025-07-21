// server/src/middleware/errorHandler.ts
import logger from "../utils/logging.js";
export const asyncHandler = (fn) => (req, res, next) => {
    Promise
        .resolve(fn(req, res, next))
        .catch(next);
};
export default function errorHandler(err, req, res, next) {
    // Логуємо помилку
    logger.error(err);
    const statusCode = err.status ?? 500;
    const message = statusCode === 500
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
//# sourceMappingURL=errorHandler.js.map