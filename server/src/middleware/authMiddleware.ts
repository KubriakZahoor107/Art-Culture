// File: server/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { Role } from "@prisma/client";

// 1) Розширюємо Express.Request, додаючи необов’язкове поле user
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: Role;
    images?: string;
  };
}

/**
 * Middleware для перевірки JWT.
 * Якщо токен валідний — кладемо user у req.user і викликаємо next().
 * Якщо ні — відповідаємо помилкою і повертаємося void.
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access token is missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    if (!decoded?.id) {
      res.status(400).json({ error: "Invalid token structure" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        // …інші ваші поля…
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    ; (req as AuthRequest).user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
    return;
  }
}

/**
 * Middleware для авторизації за ролями.
 * Якщо роль користувача не входить у allowedRoles — відповідаємо 403 і return void.
 */
export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Спочатку перевіряємо, чи вказаний req.user
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: no user in request" });
      return;
    }
    // Тепер безпечно звертаємося до req.user.role
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: insufficient rights" });
      return;
    }
    next();
  };
}

// Щоб можна було імпортувати й так:
// import authenticateToken from "../middleware/authMiddleware";
export default authenticateToken;







