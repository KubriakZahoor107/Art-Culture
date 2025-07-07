// File: server/src/controllers/adminPostsController.ts

import prisma from "../prismaClient";
import { body, validationResult } from "express-validator";
import type { Request, Response, NextFunction, Router } from "express";
import { authenticateToken, authorize } from "../middleware/authMiddleware";

export const getAllAdminPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        // Пагінація і сортування
        const page = parseInt((req.query.page as string) ?? "1", 10);
        let pageSize = parseInt((req.query.pageSize as string) ?? "20", 10);
        const orderBy = (req.query.orderBy as string) ?? "createdAt";
        const orderDir = (req.query.orderDir as "asc" | "desc") ?? "desc";

        const validColumns: [string, "asc" | "desc"][] = [
            ["createdAt", "desc"],
            ["title", "asc"],
            ["status", "asc"],
        ];
        if (!validColumns.some(([col]) => col === orderBy)) {
            res.status(400).json({ error: "Invalid sort column" });
            return;
        }
        if (pageSize > 20) pageSize = 20;

        // Фільтр по автору та статусу
        const filter: Record<string, any> = {};
        if (req.query.authorId) {
            const authorId = parseInt(req.query.authorId as string, 10);
            if (!isNaN(authorId)) filter.authorId = authorId;
        }
        if (req.query.status) filter.status = req.query.status as string;

        const posts = await prisma.post.findMany({
            where: filter,
            include: { author: { select: { id: true, email: true, title: true } } },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { [orderBy]: orderDir },
        });

        res.json({ data: posts });
    } catch (error) {
        next(error);
    }
};

export const getPendingPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const posts = await prisma.post.findMany({
            where: { status: "PENDING" },
            include: { author: { select: { id: true, email: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(posts);
    } catch (error) {
        next(error);
    }
};

export const approvePost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const postId = parseInt(req.params.id, 10);
        const updated = await prisma.post.update({
            where: { id: postId },
            data: { status: "APPROVED" },
        });
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const rejectPost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const postId = parseInt(req.params.id, 10);
        const updated = await prisma.post.update({
            where: { id: postId },
            data: { status: "REJECTED" },
        });
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const registerAdminPostRoutes = (router: Router): void => {
    router.get(
        "/pending-posts",
        authenticateToken,
        authorize("ADMIN"),
        getPendingPosts
    );

    router.get(
        "/posts",
        authenticateToken,
        authorize("ADMIN"),
        [
            body("page").optional().isInt({ min: 1 }),
            body("pageSize").optional().isInt({ min: 1, max: 20 }),
            body("orderBy")
                .optional()
                .isIn(["createdAt", "title", "status"]),
            body("orderDir").optional().isIn(["asc", "desc"]),
            body("status").optional().isIn([
                "PENDING",
                "APPROVED",
                "REJECTED",
            ]),
            body("authorId").optional().isInt(),
        ],
        getAllAdminPosts
    );

    router.patch(
        "/posts/:id/approve",
        authenticateToken,
        authorize("ADMIN"),
        approvePost
    );
    router.patch(
        "/posts/:id/reject",
        authenticateToken,
        authorize("ADMIN"),
        rejectPost
    );
};
