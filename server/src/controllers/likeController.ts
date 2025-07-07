// server/src/controllers/likeController.ts
import { Response, NextFunction } from "express";
import prisma from "../prismaClient.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * Визначає, за яким полем шукати лайки
 */
const getLikeField = (
  entityType: string
): "postId" | "productId" | "exhibitionId" | "likedUserId" | null => {
  switch (entityType) {
    case "post":
      return "postId";
    case "product":
      return "productId";
    case "exhibition":
      return "exhibitionId";
    case "user":
    case "creator":
    case "museum":
      return "likedUserId";
    default:
      return null;
  }
};

/**
 * Перемикає лайк (додає або видаляє) для вказаної сутності
 */
export const toggleLikeEntity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id; // AuthRequest гарантує, що user є
    const { entityId, entityType } = req.body;
    const idNum = parseInt(entityId as string, 10);
    const field = getLikeField(entityType as string);

    if (!field || isNaN(idNum)) {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    const whereClause = { userId, [field]: idNum } as Record<string, unknown>;
    const existing = await prisma.like.findFirst({ where: whereClause });

    let liked = false;
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: {
          [field]: idNum,
          user: { connect: { id: userId } },
        } as any,
      });
      liked = true;
    }

    const likeCount = await prisma.like.count({ where: { [field]: idNum } });
    res.status(200).json({ liked, likeCount });
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

/**
 * Повертає статус лайку (чи юзер лайкнув) та загальну кількість лайків
 */
export const getLikeStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id ?? null;
    const { entityId, entityType } = req.query;
    const idNum = parseInt(entityId as string, 10);
    const field = getLikeField(entityType as string);

    if (!field || isNaN(idNum)) {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    const likeCount = await prisma.like.count({ where: { [field]: idNum } });
    let liked = false;
    if (userId !== null) {
      liked = Boolean(
        await prisma.like.findFirst({
          where: { userId, [field]: idNum },
        })
      );
    }

    res.status(200).json({ liked, likeCount });
  } catch (err) {
    console.error("Error fetching like status:", err);
    res.status(500).json({ error: "Failed to fetch like status" });
  }
};

/**
 * Повертає лише кількість лайків для сутності
 */
export const getLikeCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityId, entityType } = req.query;
    const idNum = parseInt(entityId as string, 10);
    const field = getLikeField(entityType as string);

    if (!field || isNaN(idNum)) {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    const likeCount = await prisma.like.count({ where: { [field]: idNum } });
    res.status(200).json({ likeCount });
  } catch (err) {
    console.error("Error fetching like count:", err);
    res.status(500).json({ error: "Failed to fetch like count" });
  }
};

/**
 * Топ-10 постів за кількістю лайків
 */
export const getTopLikedPosts = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      include: { _count: { select: { likes: true } } },
      orderBy: { likes: { _count: "desc" } },
      take: 10,
    });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching top liked posts:", err);
    res.status(500).json({ error: "Failed to fetch top liked posts" });
  }
};

/**
 * Топ-10 музеїв за отриманими лайками
 */
export const getTopLikedMuseums = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const museums = await prisma.user.findMany({
      where: { role: "MUSEUM" },
      include: { _count: { select: { likesReceived: true } } },
      orderBy: { likesReceived: { _count: "desc" } },
      take: 10,
    });
    res.json(museums);
  } catch (err) {
    console.error("Error fetching top liked museums:", err);
    res.status(500).json({ error: "Failed to fetch top liked museums" });
  }
};

/**
 * Топ-10 виставок за лайками
 */
export const getTopLikedExhibitions = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const exhibitions = await prisma.exhibition.findMany({
      include: { images: true, _count: { select: { likes: true } } },
      orderBy: { likes: { _count: "desc" } },
      take: 10,
    });
    res.json(exhibitions);
  } catch (err) {
    console.error("Error fetching top liked exhibitions:", err);
    res.status(500).json({ error: "Failed to fetch top liked exhibitions" });
  }
};

/**
 * Топ-10 картин за лайками
 */
export const getTopLikedPaintings = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const paintings = await prisma.product.findMany({
      include: { images: true, _count: { select: { likes: true } } },
      orderBy: { likes: { _count: "desc" } },
      take: 10,
    });
    res.json(paintings);
  } catch (err) {
    console.error("Error fetching top liked paintings:", err);
    res.status(500).json({ error: "Failed to fetch top liked paintings" });
  }
};
