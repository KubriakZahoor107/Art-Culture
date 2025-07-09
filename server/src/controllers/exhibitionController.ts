// server/src/controllers/exhibitionController.ts

import { Request, Response, NextFunction, Express } from 'express';
import prisma from '../prismaClient.js';
import logger from '../utils/logging.js';

export const createExhibitions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title_en,
      title_uk,
      description_en,
      description_uk,
      startDate,
      endDate,
      time,
      endTime,
      location_en,
      location_uk,
      latitude,
      longitude,
      address,
      museumId,
      artistIds,
      paintingIds,
    } = req.body as Record<string, any>;

    // Валідація масивів ID
    if (!Array.isArray(artistIds) || artistIds.some((id) => isNaN(id))) {
      res.status(400).json({ errors: [{ msg: 'Invalid artist IDs' }] });
      return;
    }
    if (!Array.isArray(paintingIds) || paintingIds.some((id) => isNaN(id))) {
      res.status(400).json({ errors: [{ msg: 'Invalid painting IDs' }] });
      return;
    }

    const parsedMuseumId = parseInt(museumId, 10);
    if (isNaN(parsedMuseumId)) {
      res.status(400).json({ errors: [{ msg: 'Invalid museum ID' }] });
      return;
    }

    const userId = (req as Request & { user: { id: number } }).user.id;

    // Файли з Multer
    const files = (req.files as Express.Multer.File[]) || [];
    const images = files.map((file) => ({
      imageUrl: `/uploads/exhibitionsImages/${file.filename}`,
    }));

    // Створюємо експозицію
    const exhibition = await prisma.exhibition.create({
      data: {
        title_en,
        title_uk,
        description_en,
        description_uk,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        time,
        endTime,
        location_en,
        location_uk,
        latitude: latitude != null ? parseFloat(latitude) : null,
        longitude: longitude != null ? parseFloat(longitude) : null,
        address: address || null,
        images: { create: images },
        createdBy: { connect: { id: userId } },
        museum: { connect: { id: parsedMuseumId } },
        exhibitionArtists: {
          create: artistIds.map((aid: number) => ({ artist: { connect: { id: aid } } })),
        },
        products: {
          create: paintingIds.map((pid: number) => ({ product: { connect: { id: pid } } })),
        },
      },
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
      },
    });

    res.status(201).json({ exhibition, message: 'Exhibition created successfully' });
  } catch (error) {
    logger.error('Error creating exhibition:', error);
    next(error);
  }
};

export const getAllExhibitions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const exhibitions = await prisma.exhibition.findMany({
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
      },
      orderBy: { startDate: 'desc' },
    });
    res.json(exhibitions);
  } catch (error) {
    logger.error('Error fetching all exhibitions:', error);
    next(error);
  }
};

export const getExhibitionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid exhibition ID' });
      return;
    }
    const exhibition = await prisma.exhibition.findUnique({
      where: { id },
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
      },
    });
    if (!exhibition) {
      res.status(404).json({ error: 'Exhibition not found' });
      return;
    }
    res.json(exhibition);
  } catch (error) {
    logger.error('Error fetching exhibition by ID:', error);
    next(error);
  }
};

export const getMyExhibitions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { id: number } }).user.id;
    const exhibitions = await prisma.exhibition.findMany({
      where: { createdById: userId },
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
      },
      orderBy: { startDate: 'desc' },
    });
    res.json(exhibitions);
  } catch (error) {
    logger.error('Error fetching my exhibitions:', error);
    next(error);
  }
};

export const getProductsByExhibitionId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const exhibitionId = parseInt(req.params.exhibitionId, 10);
    if (isNaN(exhibitionId)) {
      res.status(400).json({ error: 'Invalid exhibition ID' });
      return;
    }
    const record = await prisma.exhibition.findUnique({
      where: { id: exhibitionId },
      include: { products: { include: { product: true } } },
    });
    if (!record) {
      res.status(404).json({ error: 'Exhibition not found' });
      return;
    }
    res.json(record.products.map((p) => p.product));
  } catch (error) {
    logger.error('Error fetching products for exhibition:', error);
    next(error);
  }
};

export const updateExhibition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid exhibition ID' });
      return;
    }
    const updated = await prisma.exhibition.update({
      where: { id },
      data: req.body,
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
      },
    });
    res.json(updated);
  } catch (error) {
    logger.error('Error updating exhibition:', error);
    next(error);
  }
};

export const deleteExhibition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid exhibition ID' });
      return;
    }
    await prisma.exhibition.delete({ where: { id } });
    res.json({ message: 'Exhibition deleted successfully' });
  } catch (error) {
    logger.error('Error deleting exhibition:', error);
    next(error);
  }
};

