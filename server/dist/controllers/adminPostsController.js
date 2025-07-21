import prisma from "../prismaClient.js";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/authMiddleware.js"; // Імпортуємо authenticateToken як іменований
import authorize from '../middleware/roleMiddleware.js';
export const getAllAdminPosts = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Пагинация и сортировка
        const page = parseInt(req.query.page ?? "1", 10);
        let pageSize = parseInt(req.query.pageSize ?? "20", 10);
        const orderBy = req.query.orderBy ?? "createdAt";
        const orderDir = req.query.orderDir ?? "desc";
        const validColumns = ["createdAt", "title", "status"];
        if (!validColumns.includes(orderBy)) {
            return res.status(400).json({ error: "Invalid sort column" });
        }
        if (pageSize > 20)
            pageSize = 20;
        // Фильтр по автору и статусу
        const filter = {};
        if (req.query.authorId) {
            const authorId = parseInt(req.query.authorId, 10);
            if (!isNaN(authorId))
                filter.authorId = authorId;
        }
        if (req.query.status)
            filter.status = req.query.status;
        const posts = await prisma.post.findMany({
            where: filter,
            include: { author: { select: { id: true, email: true, title: true } } },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { [orderBy]: orderDir },
        });
        return res.json({ data: posts });
    }
    catch (error) {
        return next(error);
    }
};
export const getPendingPosts = async (req, res, next) => {
    try {
        const posts = await prisma.post.findMany({
            where: { status: "PENDING" },
            include: { author: { select: { id: true, email: true } } },
            orderBy: { createdAt: "desc" },
        });
        return res.json(posts);
    }
    catch (error) {
        return next(error);
    }
};
export const approvePost = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const updated = await prisma.post.update({
            where: { id: postId },
            data: { status: "APPROVED" },
        });
        return res.json(updated);
    }
    catch (error) {
        return next(error);
    }
};
export const rejectPost = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const updated = await prisma.post.update({
            where: { id: postId },
            data: { status: "REJECTED" },
        });
        return res.json(updated);
    }
    catch (error) {
        return next(error);
    }
};
export const registerAdminPostRoutes = (router) => {
    router.get("/pending-posts", authenticateToken, authorize("ADMIN"), // Використовуємо authorize
    getPendingPosts);
    router.get("/posts", authenticateToken, authorize("ADMIN"), // Використовуємо authorize
    [
        body("page").optional().isInt({ min: 1 }),
        body("pageSize").optional().isInt({ min: 1, max: 20 }),
        body("orderBy").optional().isIn(["createdAt", "title", "status"]),
        body("orderDir").optional().isIn(["asc", "desc"]),
        body("status").optional().isIn(["PENDING", "APPROVED", "REJECTED"]),
        body("authorId").optional().isInt(),
    ], getAllAdminPosts);
    router.patch("/posts/:id/approve", authenticateToken, authorize("ADMIN"), // Використовуємо authorize
    approvePost);
    router.patch("/posts/:id/reject", authenticateToken, authorize("ADMIN"), // Використовуємо authorize
    rejectPost);
};
//# sourceMappingURL=adminPostsController.js.map