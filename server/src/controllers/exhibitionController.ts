// Файл: src/controllers/exhibitionController.ts

import { Request, Response, NextFunction, Express } from 'express'
import prisma from '../prismaClient'
import logger from '../utils/logging'

export const createExhibitions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    } = req.body

    // Перевірки коректності масивів ID
    if (!Array.isArray(artistIds) || artistIds.some(isNaN)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid artist IDs' }] })
    }
    if (!Array.isArray(paintingIds) || paintingIds.some(isNaN)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid painting IDs' }] })
    }

    const parsedMuseumId = parseInt(museumId, 10)
    if (isNaN(parsedMuseumId)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid museum ID' }] })
    }

    const userId = (req as Request & { user: { id: number } }).user.id

    // Обробка файлів з Multer
    const files = req.files as Express.Multer.File[] | undefined
    const images = files
      ? files.map(file => ({
        imageUrl: `/uploads/exhibitionsImages/${file.filename}`,
      }))
      : []

    // Перевіряємо, що всі artistIds існують і мають роль CREATOR
    const creators = await prisma.user.findMany({
      where: { id: { in: artistIds }, role: 'CREATOR' },
    })
    if (creators.length !== artistIds.length) {
      return res.status(400).json({ errors: [{ msg: 'Some artist IDs are invalid' }] })
    }

    // Перевіряємо products
    const paintings = await prisma.product.findMany({
      where: { id: { in: paintingIds }, authorId: { in: artistIds } },
    })
    if (paintings.length !== paintingIds.length) {
      return res.status(400).json({ errors: [{ msg: 'Some paintings are invalid' }] })
    }

    // Перевіряємо музей
    const museum = await prisma.user.findUnique({ where: { id: parsedMuseumId } })
    if (!museum || museum.role !== 'MUSEUM') {
      return res.status(400).json({ errors: [{ msg: 'Invalid museum' }] })
    }

    // Створюємо запис про виставку
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
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
        address: address || null,
        images: { create: images },
        createdBy: { connect: { id: userId } },
        museum: { connect: { id: parsedMuseumId } },
        exhibitionArtists: {
          create: artistIds.map(artistId => ({
            artist: { connect: { id: artistId } },
          })),
        },
        products: {
          create: paintingIds.map(paintingId => ({
            product: { connect: { id: paintingId } },
          })),
        },
      },
      include: {
        images: true,
        exhibitionArtists: { include: { artist: true } },
        products: { include: { product: true } },
      },
    })

    return res
      .status(201)
      .json({ exhibition, message: 'Exhibition created successfully' })
  } catch (error) {
    logger.error('Error creating exhibition:', error)
    return next(error)
  }
}
