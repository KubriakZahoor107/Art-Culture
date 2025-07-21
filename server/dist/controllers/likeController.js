import prisma from "../prismaClient.js";
/** Map the incoming entityType to the Prisma relation field */
const relationMap = {
    post: { idField: "postId", relationName: "post" },
    product: { idField: "productId", relationName: "product" },
    exhibition: { idField: "exhibitionId", relationName: "exhibition" },
    user: { idField: "likedUserId", relationName: "likedUser" },
    creator: { idField: "likedUserId", relationName: "likedUser" },
    museum: { idField: "likedUserId", relationName: "likedUser" },
};
/**
 * Toggle a like on or off for the given entity
 */
export const toggleLikeEntity = async (req, // Змінено з AuthRequest на Request
res, next) => {
    try {
        // req.user! використовується, оскільки ми очікуємо, що middleware автентифікації
        // вже додав user до запиту. Якщо user може бути відсутнім,
        // вам слід додати перевірку if (!req.user) { ... }
        const userId = req.user.id;
        const { entityId, entityType } = req.body;
        if (!(entityType in relationMap)) {
            res.status(400).json({ error: "Invalid entityType" });
            return;
        }
        const { idField, relationName } = relationMap[entityType];
        const idNum = parseInt(entityId, 10);
        if (isNaN(idNum)) {
            res.status(400).json({ error: "Invalid entityId" });
            return;
        }
        // Build a where-clause looking for an existing like
        const whereClause = { userId };
        whereClause[idField] = idNum;
        const existing = await prisma.like.findFirst({ where: whereClause });
        let liked = false;
        if (existing) {
            // unlike
            await prisma.like.delete({ where: { id: existing.id } });
        }
        else {
            // like
            await prisma.like.create({
                data: {
                    user: { connect: { id: userId } },
                    [relationName]: { connect: { id: idNum } },
                },
            });
            liked = true;
        }
        const likeCount = await prisma.like.count({
            where: { [idField]: idNum },
        });
        res.status(200).json({ liked, likeCount });
    }
    catch (err) {
        console.error("Error toggling like:", err);
        next(err);
    }
};
/**
 * Get whether the current user has liked, plus total like count
 */
export const getLikeStatus = async (req, // Змінено з AuthRequest на Request
res, next) => {
    try {
        // req.user?.id використовується, оскільки user може бути необов'язковим для цього ендпоінту
        const userId = req.user?.id;
        const { entityId, entityType } = req.query;
        if (!(entityType in relationMap)) {
            res.status(400).json({ error: "Invalid entityType" });
            return;
        }
        const { idField } = relationMap[entityType];
        const idNum = parseInt(entityId, 10);
        if (isNaN(idNum)) {
            res.status(400).json({ error: "Invalid entityId" });
            return;
        }
        const likeCount = await prisma.like.count({
            where: { [idField]: idNum },
        });
        const liked = userId
            ? Boolean(await prisma.like.findFirst({
                where: { userId, [idField]: idNum },
            }))
            : false;
        res.status(200).json({ liked, likeCount });
    }
    catch (err) {
        console.error("Error fetching like status:", err);
        next(err);
    }
};
/**
 * Get total like count only
 */
export const getLikeCount = async (req, // Змінено з AuthRequest на Request
res, next) => {
    try {
        const { entityId, entityType } = req.query;
        if (!(entityType in relationMap)) {
            res.status(400).json({ error: "Invalid entityType" });
            return;
        }
        const { idField } = relationMap[entityType];
        const idNum = parseInt(entityId, 10);
        if (isNaN(idNum)) {
            res.status(400).json({ error: "Invalid entityId" });
            return;
        }
        const likeCount = await prisma.like.count({
            where: { [idField]: idNum },
        });
        res.status(200).json({ likeCount });
    }
    catch (err) {
        console.error("Error fetching like count:", err);
        next(err);
    }
};
/**
 * Top 10 posts by likes
 */
export const getTopLikedPosts = async (_req, // Змінено з AuthRequest на Request
res, next) => {
    try {
        const posts = await prisma.post.findMany({
            include: { _count: { select: { likes: true } } },
            orderBy: { likes: { _count: "desc" } },
            take: 10,
        });
        res.status(200).json(posts);
    }
    catch (err) {
        console.error("Error fetching top liked posts:", err);
        next(err);
    }
};
/**
 * Top 10 museums by likes received
 */
export const getTopLikedMuseums = async (_req, // Змінено з AuthRequest на Request
res, next) => {
    try {
        const museums = await prisma.user.findMany({
            where: { role: "MUSEUM" },
            include: { _count: { select: { likesReceived: true } } },
            orderBy: { likesReceived: { _count: "desc" } },
            take: 10,
        });
        res.status(200).json(museums);
    }
    catch (err) {
        console.error("Error fetching top liked museums:", err);
        next(err);
    }
};
/**
 * Top 10 exhibitions by likes
 */
export const getTopLikedExhibitions = async (_req, // Змінено з AuthRequest на Request
res, next) => {
    try {
        const exhibitions = await prisma.exhibition.findMany({
            include: { images: true, _count: { select: { likes: true } } },
            orderBy: { likes: { _count: "desc" } },
            take: 10,
        });
        res.status(200).json(exhibitions);
    }
    catch (err) {
        console.error("Error fetching top liked exhibitions:", err);
        next(err);
    }
};
/**
 * Top 10 paintings by likes
 */
export const getTopLikedPaintings = async (_req, // Змінено з AuthRequest на Request
res, next) => {
    try {
        const paintings = await prisma.product.findMany({
            include: { images: true, _count: { select: { likes: true } } },
            orderBy: { likes: { _count: "desc" } },
            take: 10,
        });
        res.status(200).json(paintings);
    }
    catch (err) {
        console.error("Error fetching top liked paintings:", err);
        next(err);
    }
};
//# sourceMappingURL=likeController.js.map