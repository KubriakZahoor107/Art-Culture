// server/src/controllers/adminController.ts
import { Response, NextFunction } from 'express';
import prisma from '../prismaClient.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getAllUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        title: true,
        createdAt: true
      }
    });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
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
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { email, role, title, bio, country, city } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: { email, role, title, bio, country, city }
    });
    res.status(200).json({ user: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

