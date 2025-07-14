// server/src/controllers/adminUsersController.ts
import type { Request, Response, NextFunction, Router } from "express";
import { body, validationResult } from "express-validator";
import prisma from "../prismaClient.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMIddleware.js"

// Валидные столбцы и их дефолтные направления
const validColumns: Array<[string, "asc" | "desc"]> = [
  ["createdAt", "desc"],
  ["title", "asc"],
  // добавьте другие столбцы при необходимости
];

// GET /api/admin/users
export const getAllAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // 1) Валидация запроса
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 2) Пагинация
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const rawPageSize = parseInt((req.query.pageSize as string) || "20", 10);
    const pageSize = Math.min(rawPageSize, 20);

    // 3) Сортировка
    const orderBy = (req.query.orderBy as string) || validColumns[0][0];
    if (!validColumns.some(([col]) => col === orderBy)) {
      return res.status(400).json({ error: "Invalid sort column" });
    }
    const [, defaultDir] = validColumns.find(([col]) => col === orderBy)!;
    const orderDir = (req.query.orderDir as "asc" | "desc") ?? defaultDir;
    if (!["asc", "desc"].includes(orderDir)) {
      return res.status(400).json({ error: "Invalid sort direction" });
    }

    // 4) Фильтр по authorId
    const filter: Record<string, unknown> = {};
    if (req.query.authorId) {
      const authorIdNum = parseInt(req.query.authorId as string, 10);
      if (!Number.isNaN(authorIdNum)) filter.authorId = authorIdNum;
    }

    // 5) Запрос к БД
    const users = await prisma.user.findMany({
      where: filter,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [orderBy]: orderDir },
    });

    // 6) Ответ
    return res.json({ page, pageSize, data: users });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (
  req: Request & { user?: { id: number } },
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (req.user?.id === userId && role !== "ADMIN") {
      return res
        .status(400)
        .json({ error: "Admin cannot change your own role" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    return res.json({ user: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return next(error);
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (
  req: Request & { user?: { id: number } },
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (req.user?.id === userId) {
      return res
        .status(400)
        .json({ error: "Admin cannot delete own account" });
    }

    await prisma.user.delete({ where: { id: userId } });
    return res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return next(error);
  }
};

// Регистрация маршрутов
export const registerAdminUserRoutes = (router: Router): void => {
  router.get(
    "/users",
    authenticateToken,
    authorize("ADMIN"),
    body("page").optional().isInt({ min: 1 }),
    body("pageSize").optional().isInt({ min: 1, max: 20 }),
    body("orderBy").optional().isIn(validColumns.map(([col]) => col)),
    body("orderDir").optional().isIn(["asc", "desc"]),
    body("authorId").optional().isInt(),
    getAllAdminUsers
  );

  router.put(
    "/users/:id/role",
    authenticateToken,
    authorize("ADMIN"),
    body("role")
      .isIn(["ADMIN", "USER", "MUSEUM", "CREATOR", "EDITOR"])
      .withMessage("Invalid role"),
    updateUserRole
  );

  router.delete(
    "/users/:id",
    authenticateToken,
    authorize("ADMIN"),
    deleteUser
  );
};


