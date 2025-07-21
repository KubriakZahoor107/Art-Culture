// server/src/controllers/exhibitionController.ts
import { Request, Response, NextFunction } from 'express' // Використовуємо стандартний Request
import prisma from '../prismaClient.js'
import logger from '../utils/logging.js'


export const createExhibitions = async (
  req: Request, // Змінено з AuthRequest на Request
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
    } = req.body as Record<string, any>

    // Валідація масивів ID
    if (!Array.isArray(artistIds) || artistIds.some((id) => isNaN(id))) {
      res.status(400).json({ errors: [{ msg: 'Invalid artist IDs' }] })
      return
    }
    if (!Array.isArray(paintingIds) || paintingIds.some((id) => isNaN(id))) {
      res.status(400).json({ errors: [{ msg: 'Invalid painting IDs' }] })
      return
    }

    const parsedMuseumId = parseInt(museumId, 10)
    if (isNaN(parsedMuseumId)) {
      res.status(400).json({ errors: [{ msg: 'Invalid museum ID' }] })
      return
    }

    const userId = req.user!.id

    // Файли з Multer
    const files = (req.files as Express.Multer.File[]) ?? []
    const images = files.map((file) => ({
      imageUrl: `/uploads/exhibitionsImages/${file.filename}`,
    }))

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
        // Виправлено: 'createdBy' на 'createdById' для підключення за ID
        createdById: userId,
        // Виправлено: 'museum' на 'museumId' для підключення за ID
        museumId: parsedMuseumId,
        exhibitionArtists: {
          create: artistIds.map((aid: number) => ({
            artist: { connect: { id: aid } },
          })),
        },
        products: {
          create: paintingIds.map((pid: number) => ({
            product: { connect: { id: pid } },
          })),
        },
      },
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
      },
    })

    res.status(201).json({
      exhibition,
      message: 'Exhibition created successfully',
    })
  } catch (error) {
    logger.error('Error creating exhibition:', error)
    next(error)
  }
}

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
        // Додано: включення інформації про музей та творця, якщо потрібно
        user_Exhibition_museumIdTouser: { // Відношення до музею
          include: { museum_logo_images: true }
        },
        user_Exhibition_createdByIdTouser: { // Відношення до творця
          select: { id: true, email: true, title: true }
        }
      },
      orderBy: { startDate: 'desc' },
    })
    res.status(200).json({ exhibitions })
  } catch (error) {
    logger.error('Error fetching all exhibitions:', error)
    next(error)
  }
}

export const getExhibitionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid exhibition ID' })
      return
    }
    const exhibition = await prisma.exhibition.findUnique({
      where: { id },
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
        // Додано: включення інформації про музей та творця, якщо потрібно
        user_Exhibition_museumIdTouser: {
          include: { museum_logo_images: true }
        },
        user_Exhibition_createdByIdTouser: {
          select: { id: true, email: true, title: true }
        }
      },
    })
    if (!exhibition) {
      res.status(404).json({ error: 'Exhibition not found' })
      return
    }
    res.status(200).json({ exhibition })
  } catch (error) {
    logger.error('Error fetching exhibition by ID:', error)
    next(error)
  }
}

export const getMyExhibitions = async (
  req: Request, // Змінено з AuthRequest на Request
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id
    const exhibitions = await prisma.exhibition.findMany({
      where: { createdById: userId },
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
        // Додано: включення інформації про музей та творця, якщо потрібно
        user_Exhibition_museumIdTouser: {
          include: { museum_logo_images: true }
        },
        user_Exhibition_createdByIdTouser: {
          select: { id: true, email: true, title: true }
        }
      },
      orderBy: { startDate: 'desc' },
    })
    res.status(200).json({ exhibitions })
  } catch (error) {
    logger.error('Error fetching my exhibitions:', error)
    next(error)
  }
}

export const getProductsByExhibitionId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const exhibitionId = parseInt(req.params.exhibitionId, 10)
    if (isNaN(exhibitionId)) {
      res.status(400).json({ error: 'Invalid exhibition ID' })
      return
    }
    const record = await prisma.exhibition.findUnique({
      where: { id: exhibitionId },
      include: {
        products: { include: { product: true } },
        // Додано: включення інформації про музей та творця, якщо потрібно
        user_Exhibition_museumIdTouser: {
          include: { museum_logo_images: true }
        },
        user_Exhibition_createdByIdTouser: {
          select: { id: true, email: true, title: true }
        }
      },
    })
    if (!record) {
      res.status(404).json({ error: 'Exhibition not found' })
      return
    }
    const products = record.products.map((p) => p.product)
    res.status(200).json({ products })
  } catch (error) {
    logger.error('Error fetching products for exhibition:', error)
    next(error)
  }
}

export const updateExhibition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid exhibition ID' })
      return
    }
    const updated = await prisma.exhibition.update({
      where: { id },
      data: req.body,
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
        // Додано: включення інформації про музей та творця, якщо потрібно
        user_Exhibition_museumIdTouser: {
          include: { museum_logo_images: true }
        },
        user_Exhibition_createdByIdTouser: {
          select: { id: true, email: true, title: true }
        }
      },
    })
    res.status(200).json({ updated })
  } catch (error) {
    logger.error('Error updating exhibition:', error)
    next(error)
  }
}

export const deleteExhibition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid exhibition ID' })
      return
    }
    await prisma.exhibition.delete({ where: { id } })
    res.sendStatus(204)
  } catch (error) {
    logger.error('Error deleting exhibition:', error)
    next(error)
  }
}

