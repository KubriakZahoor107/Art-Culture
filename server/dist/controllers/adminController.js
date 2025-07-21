// File: /Users/konstantinkubriak/Desktop/Art-Culture/server/src/controllers/adminController.ts
import prisma from "../prismaClient.js";
/**
 * Получить всех пользователей
 */
export async function getAllUsers(req, res, next) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                title: true,
                createdAt: true,
            },
        });
        return res.json({ users });
    }
    catch (err) {
        return next(err);
    }
}
/**
 * Получить пользователя по ID
 */
export async function getUserById(req, res, next) {
    try {
        const id = Number(req.params.id);
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                title: true,
                bio: true,
                country: true,
                city: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({ user });
    }
    catch (err) {
        return next(err);
    }
}
/**
 * Обновить пользователя
 */
export async function updateUser(req, res, next) {
    try {
        const id = Number(req.params.id);
        const { email, role, title, bio, country, city } = req.body;
        const updated = await prisma.user.update({
            where: { id },
            data: { email, role, title, bio, country, city },
        });
        return res.json({ user: updated });
    }
    catch (err) {
        return next(err);
    }
}
/**
 * Удалить пользователя
 */
export async function deleteUser(req, res, next) {
    try {
        const id = Number(req.params.id);
        await prisma.user.delete({ where: { id } });
        return res.sendStatus(204);
    }
    catch (err) {
        return next(err);
    }
}
//# sourceMappingURL=adminController.js.map