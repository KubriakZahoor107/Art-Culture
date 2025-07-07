// src/controllers/userController.js

import { Request, Response, NextFunction } from "express"
import prisma from "../prismaClient.js"
import logger from "../utils/logging.js"

// src/controllers/userController.js

export async function getCreatorsByLanguage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { language } = req.params
  const { letter } = req.query

  // Log incoming request parameters
  logger.info(`Received request for language: ${language}, letter: ${letter}`)

  // Validate language
  if (!["uk", "en"].includes(language)) {
    logger.warn(`Invalid language parameter: ${language}`)
    res.status(400).json({ error: "invalid language" })
    return
  }

  let titleField = "title"

  try {
    const creators = await prisma.user.findMany({
      where: {
        role: "CREATOR",
        ...(letter && {
          [titleField]: {
            startsWith: letter,
          },
        }),
      },
      select: {
        id: true,
        email: true,
        [titleField]: true,
        bio: true,
        images: true,
      },
      orderBy: {
        [titleField]: "asc",
      },
    })

    logger.info(`Fetched ${creators.length} creators from database`)

    const mappedCreators = creators.map((creator) => ({
      id: creator.id,
      email: creator.email,
      title: creator[titleField],
      bio: creator.bio,
      images: creator.images,
    }))

    res.json({ creators: mappedCreators })
  } catch (error) {
    logger.error("Error fetching creators by language:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export async function getMuseumsByLanguage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { language } = req.params
  const { letter } = req.query

  // Log incoming request parameters
  logger.info(`Received request for language: ${language}, letter: ${letter}`)

  // Validate language
  if (!["uk", "en"].includes(language)) {
    logger.warn(`Invalid language parameter: ${language}`)
    res.status(400).json({ error: "invalid language" })
    return
  }

  let titleField = "title"

  try {
    const museums = await prisma.user.findMany({
      where: {
        role: "MUSEUM",
        ...(letter && {
          [titleField]: {
            startsWith: letter,
          },
        }),
      },
      select: {
        id: true,
        email: true,
        [titleField]: true,
        bio: true,
        images: true,
      },
      orderBy: {
        [titleField]: "asc",
      },
    })

    logger.info(`Fetched ${museums.length} creators from database`)

    const mappedMuseums = museums.map((museum) => ({
      id: museum.id,
      email: museum.email,
      title: museum[titleField],
      bio: museum.bio,
      images: museum.images,
    }))

    res.json({ museums: mappedMuseums })
  } catch (error) {
    logger.error("Error fetching museums by language:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export async function getCreators(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const creators = await prisma.user.findMany({
      where: {
        role: "CREATOR",
      },
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

export async function getCreatorById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const creatorId = parseInt(req.params.id, 10)
    if (isNaN(creatorId)) {
      res.status(400).json({ error: "invalid creator id" })
      return
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: {
        products: {
          include: {
            images: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!creator || creator.role !== "CREATOR") {
      res.status(404).json({ error: "Creator not found" })
      return
    }
    res.json({ creator })
  } catch (error) {
    logger.error("Error fetch data creator id", error)
    next(error)
  }
}

export async function getAuthorsByLanguage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { language } = req.params
  const { letter } = req.query

  //* Log incoming request parameters
  logger.info(`Received request for language: ${language}, letter: ${letter}`)

  //* Validate language
  if (!["uk", "en"].includes(language)) {
    logger.warn(`Invalid language parameter: ${language}`)
    res.status(400).json({ error: "invalid language" })
    return
  }

  let titleField = "title"

  try {
    const authors = await prisma.user.findMany({
      where: {
        role: "AUTHOR",
        ...(letter && {
          [titleField]: {
            startsWith: letter,
          },
        }),
      },
      select: {
        id: true,
        email: true,
        [titleField]: true,
        bio: true,
        images: true,
      },
      orderBy: {
        [titleField]: "asc",
      },
    })

    logger.info(`Fetched ${authors.length} authors from database`)

    const mappedAuthors = authors.map((author) => ({
      id: author.id,
      email: author.email,
      title: author[titleField],
      bio: author.bio,
      images: author.images,
    }))
    res.json({ authors: mappedAuthors })
  } catch (error) {
    logger.error("Error fetching creators by language:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export async function getAuthors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authors = await prisma.user.findMany({
      where: {
        role: "AUTHOR",
      },
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

export async function getAuthorById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorId = parseInt(req.params.id, 10)
    if (isNaN(authorId)) {
      res.status(400).json({ error: "invalid author id" })
      return
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      include: {
        products: {
          include: {
            images: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!author || author.role !== "AUTHOR") {
      res.status(404).json({ error: "Author not found" })
      return
    }
    res.json({ author })
  } catch (error) {
    logger.error("Error fetch data author id", error)
    next(error)
  }
}

export async function getMuseums(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const museums = await prisma.user.findMany({
      where: {
        role: "MUSEUM",
      },
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
        house_number: true,
        postcode: true,
        museumLogoImage: {
          select: {
            imageUrl: true,
          },
        },
      },
    })

    res.json({ museums })
  } catch (error) {
    logger.error("Error fetching museums:", error)
    next(error)
  }
}
export async function getMuseumById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const museumId = parseInt(req.params.id, 10)
    if (isNaN(museumId)) {
      res.status(400).json({ error: "invalid museum id" })
      return
    }

    const museum = await prisma.user.findUnique({
      where: { id: museumId },
      include: {
        museumLogoImage: true,
        products: {
          include: {
            images: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!museum || museum.role !== "MUSEUM") {
      res.status(404).json({ error: "Museum not found" })
      return
    }
    res.json({ museum })
  } catch (error) {
    logger.error("Error fetch data creator id", error)
    next(error)
  }
}

export async function getExhibitions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exhibition = await prisma.user.findMany({
      where: {
        role: "EXHIBITION",
      },
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

    res.json({ exhibition })
  } catch (error) {
    logger.error("Error fetching exhibitions:", error)
    next(error)
  }
}

export async function getExhibitionById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exhibitionId = parseInt(req.params.id, 10)
    if (isNaN(exhibitionId)) {
      res.status(400).json({ error: "invalid exhibition id" })
      return
    }

    const exhibition = await prisma.user.findUnique({
      where: { id: exhibitionId },
      include: {
        products: {
          include: {
            images: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!exhibition || exhibition.role !== "EXHIBITION") {
      res.status(404).json({ error: "Exhibition not found" })
      return
    }
    res.json({ exhibition })
  } catch (error) {
    logger.error("Error fetch data creator id", error)
    next(error)
  }
}
