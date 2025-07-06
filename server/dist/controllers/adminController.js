import prisma from "../prismaClient.js";
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
        res.json({ users });
    }
    catch (err) {
        next(err);
    }
}
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
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
}
export async function updateUser(req, res, next) {
    try {
        const id = Number(req.params.id);
        const { email, role, title, bio, country, city } = req.body;
        const updated = await prisma.user.update({
            where: { id },
            data: { email, role, title, bio, country, city },
        });
        res.json({ user: updated });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteUser(req, res, next) {
    try {
        const id = Number(req.params.id);
        await prisma.user.delete({ where: { id } });
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
}
