import { body, validationResult } from "express-validator";
import prisma from "../prismaClient.js";
import authenticateToken from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMIddleware.js";
// Валідні стовпці та їх дефолтні напрями
const validColumns = [
    ["createdAt", "desc"],
    ["title", "asc"],
    // додайте інші стовпці за потреби
];
// GET /api/admin/users
export const getAllAdminUsers = async (req, res, next) => {
    try {
        // 1) Валідація запиту
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        // 2) Пагінація
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const rawPageSize = parseInt(req.query.pageSize || "20", 10);
        const pageSize = Math.min(rawPageSize, 20);
        // 3) Сортування
        const orderBy = req.query.orderBy || validColumns[0][0];
        if (!validColumns.some(([col]) => col === orderBy)) {
            res.status(400).json({ error: "Invalid sort column" });
            return;
        }
        const [, defaultDir] = validColumns.find(([col]) => col === orderBy);
        const orderDir = req.query.orderDir ?? defaultDir;
        if (!["asc", "desc"].includes(orderDir)) {
            res.status(400).json({ error: "Invalid sort direction" });
            return;
        }
        // 4) Фільтр по authorId
        const filter = {};
        if (req.query.authorId) {
            const authorIdNum = parseInt(req.query.authorId, 10);
            if (!Number.isNaN(authorIdNum))
                filter.authorId = authorIdNum;
        }
        // 5) Запит до БД
        const users = await prisma.user.findMany({
            where: filter,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { [orderBy]: orderDir },
        });
        // 6) Відповідь
        res.json({ page, pageSize, data: users });
    }
    catch (err) {
        next(err);
    }
};
// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const userId = parseInt(req.params.id, 10);
        const { role } = req.body;
        if (req.user?.id === userId && role !== "ADMIN") {
            res.status(400).json({ error: "Admin cannot change your own role" });
            return;
        }
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, email: true, role: true },
        });
        res.json(updated);
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ error: "User not found" });
            return;
        }
        next(error);
    }
};
// DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (req.user?.id === userId) {
            res.status(400).json({ error: "Admin cannot delete own account" });
            return;
        }
        await prisma.user.delete({ where: { id: userId } });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ error: "User not found" });
            return;
        }
        next(error);
    }
};
// Функція реєстрації маршрутів
export const registerAdminUserRoutes = (router) => {
    router.get("/users", authenticateToken, authorize("ADMIN"), 
    // валідація query-параметрів
    body("page").optional().isInt({ min: 1 }), body("pageSize").optional().isInt({ min: 1, max: 20 }), body("orderBy").optional().isIn(validColumns.map(([col]) => col)), body("orderDir").optional().isIn(["asc", "desc"]), body("authorId").optional().isInt(), getAllAdminUsers);
    router.put("/users/:id/role", authenticateToken, authorize("ADMIN"), body("role")
        .isIn(["ADMIN", "USER", "MUSEUM", "CREATOR", "EDITOR"])
        .withMessage("Invalid role"), updateUserRole);
    router.delete("/users/:id", authenticateToken, authorize("ADMIN"), deleteUser);
};
