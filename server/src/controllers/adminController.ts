import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";

export const getPendingCounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const getPostCounts = await prisma.post.count({
      where: { status: "PENDING" },
    });

    const getCardCounts = await prisma.product.count({
      where: { status: "PENDING" },
    });

    return res.json({
      posts: getPostCounts,
      products: getCardCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    return res.json(products);
  } catch (error) {
    next(error);
  }
};

export const approveProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: "APPROVED" },
    });

    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const rejectProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: "REJECTED" },
    });

    return res.json(updated);
  } catch (error) {
    next(error);
  }
};
