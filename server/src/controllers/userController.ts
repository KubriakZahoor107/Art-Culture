// /Users/konstantinkubriak/Desktop/Art-Culture/server/src/controllers/userController.ts

import { Request, Response, NextFunction } from "express"
import prisma from "../prismaClient.js"
import logger from "../utils/logging.js"

// Helpers to map dynamic title field based on language
const getTitleField = (language: string): "title_en" | "title_uk" => {
  return language === "uk" ? "title_uk" : "title_en"
}

/**
 * GET /creators/lang/:language?letter=x
 */
export const getCreatorsByLanguage = async (
  req: Request<{ language: string }, any, any, { letter?: string }>,
  res: Response,
  next: NextFunction
) => {
  const { language } = req.params
  const { letter } = req.query

  logger.info(`Received request for language: ${language}, letter: ${letter}`)

  if (!["uk", "en"].includes(language)) {
    logger.warn(`Invalid language parameter: ${language}`)
    return res.status(400).json({ error: "invalid language" })
  }

  const titleField = getTitleField(language)

  try {
    const creators = await prisma.user.findMany({
      where: {
        role: "CREATOR",
        ...(letter
          ? { [titleField]: { startsWith: letter, mode: "insensitive" } }
          : {}),
      },
      select: {
        id: true,
        email: true,
        [titleField]: true,
        bio: true,
        images: true,
      },
      orderBy: { [titleField]: "asc" },
    })

    logger.info(`Fetched ${creators.length} creators from database`)

    const mapped = creators.map((c) => ({
      id: c.id,
      email: c.email,
      title: c[titleField],
      bio: c.bio,
      images: c.images,
    }))

    res.json({ creators: mapped })
  } catch (error) {
    logger.error("Error fetching creators by language:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * GET /museums/lang/:language?letter=x
 */
export const getMuseumsByLanguage = async (
  req: Request<{ language: string }, any, any, { letter?: string }>,
  res: Response,
  next: NextFunction
) => {
  const { language } = req.params
  const { letter } = req.query

  logger.info(`Received request for language: ${language}, letter: ${letter}`)

  if (!["uk", "en"].includes(language)) {
    logger.warn(`Invalid language parameter: ${language}`)
    return res.status(400).json({ error: "invalid language" })
  }

  const titleField = getTitleField(language)

  try {
    const museums = await prisma.user.findMany({
      where: {
        role: "MUSEUM",
        ...(letter
          ? { [titleField]: { startsWith: letter, mode: "insensitive" } }
          : {}),
      },
      select: {
        id: true,
        email: true,
        [titleField]: true,
        bio: true,
        images: true,
      },
      orderBy: { [titleField]: "asc" },
    })

    logger.info(`Fetched ${museums.length} museums from database`)

    const mapped = museums.map((m) => ({
      id: m.id,
      email: m.email,
      title: m[titleField],
      bio: m.bio,
      images: m.images,
    }))

    res.json({ museums: mapped })
  } catch (error) {
    logger.error("Error fetching museums by language:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * GET /creators
 */
export const getCreators = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const creators = await prisma.user.findMany({
      where: { role: "CREATOR" },
      select: {
        id: true,
        email: true,
        title: true,
        bio: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    res.json({ creators })
  } catch (error) {
    logger.error("Error fetching creators:", error)
    next(error)
  }
}

/**
 * GET /creators/:id
 */
export const getCreatorById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const creatorId = parseInt(req.params.id, 10)
    if (isNaN(creatorId)) {
      return res.status(400).json({ error: "invalid creator id" })
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: {
        // ВИПРАВЛЕНО: Змінено на правильний регістр products_Product_authorIdTouser
        products_Product_authorIdTouser: {
          include: { images: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!creator || creator.role !== "CREATOR") {
      return res.status(404).json({ error: "Creator not found" })
    }
    res.json({ creator })
  } catch (error) {
    logger.error("Error fetching creator by ID:", error)
    next(error)
  }
}

/**
 * GET /authors/lang/:language?letter=x
 */
export const getAuthorsByLanguage = async (
  req: Request<{ language: string }, any, any, { letter?: string }>,
  res: Response,
  next: NextFunction
) => {
  const { language } = req.params
  const { letter } = req.query

  logger.info(`Received request for language: ${language}, letter: ${letter}`)

  if (!["uk", "en"].includes(language)) {
    logger.warn(`Invalid language parameter: ${language}`)
    return res.status(400).json({ error: "invalid language" })
  }

  const titleField = getTitleField(language)

  try {
    const authors = await prisma.user.findMany({
      where: {
        role: "AUTHOR",
        ...(letter
          ? { [titleField]: { startsWith: letter, mode: "insensitive" } }
          : {}),
      },
      select: {
        id: true,
        email: true,
        [titleField]: true,
        bio: true,
        images: true,
      },
      orderBy: { [titleField]: "asc" },
    })

    logger.info(`Fetched ${authors.length} authors from database`)

    const mapped = authors.map((a) => ({
      id: a.id,
      email: a.email,
      title: a[titleField],
      bio: a.bio,
      images: a.images,
    }))
    res.json({ authors: mapped })
  } catch (error) {
    logger.error("Error fetching authors by language:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * GET /authors
 */
export const getAuthors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authors = await prisma.user.findMany({
      where: { role: "AUTHOR" },
      select: {
        id: true,
        email: true,
        title: true,
        bio: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    res.json({ authors })
  } catch (error) {
    logger.error("Error fetching authors:", error)
    next(error)
  }
}

/**
 * GET /authors/:id
 */
export const getAuthorById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorId = parseInt(req.params.id, 10)
    if (isNaN(authorId)) {
      return res.status(400).json({ error: "invalid author id" })
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      include: {
        // ВИПРАВЛЕНО: Змінено на правильний регістр products_Product_authorIdTouser
        products_Product_authorIdTouser: {
          include: { images: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!author || author.role !== "AUTHOR") {
      return res.status(404).json({ error: "Author not found" })
    }
    res.json({ author })
  } catch (error) {
    logger.error("Error fetching author by ID:", error)
    next(error)
  }
}

/**
 * GET /museums
 */
export const getMuseums = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const museums = await prisma.user.findMany({
      where: { role: "MUSEUM" },
      select: {
        id: true,
        email: true,
        title: true,
        bio: true,
        images: true,
        createdAt: true,
        updatedAt: true,
        lat: true,
        lon: true,
        country: true,
        city: true,
        street: true,
        houseNumber: true,
        // Змінено: 'museumLogoImage' на 'museum_logo_images' згідно schema.prisma
        museum_logo_images: {
          select: { imageUrl: true },
        },
      },
    })
    res.json({ museums })
  } catch (error) {
    logger.error("Error fetching museums:", error)
    next(error)
  }
}

/**
 * GET /museums/:id
 */
export const getMuseumById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const museumId = parseInt(req.params.id, 10)
    if (isNaN(museumId)) {
      return res.status(400).json({ error: "invalid museum id" })
    }

    const museum = await prisma.user.findUnique({
      where: { id: museumId },
      include: {
        // Змінено: 'museumLogoImage' на 'museum_logo_images' згідно schema.prisma
        museum_logo_images: true,
        // ВИПРАВЛЕНО: Змінено на правильний регістр products_Product_museumIdTouser
        products_Product_museumIdTouser: {
          include: { images: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!museum || museum.role !== "MUSEUM") {
      return res.status(404).json({ error: "Museum not found" })
    }
    res.json({ museum })
  } catch (error) {
    logger.error("Error fetching museum by ID:", error)
    next(error)
  }
}

/**
 * GET /exhibitions
 */
export const getExhibitions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const exhibitions = await prisma.user.findMany({
      where: { role: "EXHIBITION" },
      select: {
        id: true,
        email: true,
        title: true,
        bio: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    res.json({ exhibitions })
  } catch (error) {
    logger.error("Error fetching exhibitions:", error)
    next(error)
  }
}

/**
 * GET /exhibitions/:id
 */
export const getExhibitionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const exhibitionId = parseInt(req.params.id, 10)
    if (isNaN(exhibitionId)) {
      return res.status(400).json({ error: "invalid exhibition id" })
    }

    const exhibition = await prisma.user.findUnique({
      where: { id: exhibitionId },
      include: {
        // ВИПРАВЛЕНО: Змінено на правильний регістр products_Product_authorIdTouser
        // Примітка: Якщо користувач з роллю "EXHIBITION" не є автором продуктів
        // або не є музеєм, який володіє продуктами, ця відносина може бути нерелевантною.
        // Перевірте логіку вашого додатку.
        products_Product_authorIdTouser: { // Змінено на products_Product_authorIdTouser
          include: { images: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!exhibition || exhibition.role !== "EXHIBITION") {
      return res.status(404).json({ error: "Exhibition not found" })
    }
    res.json({ exhibition })
  } catch (error) {
    logger.error("Error fetching exhibition by ID:", error)
    next(error)
  }
}
