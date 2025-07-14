// /Users/konstantinkubriak/Desktop/Art-Culture/server/src/controllers/searchController.ts

import { Request, Response, NextFunction } from "express"
import prisma from "../prismaClient.js"


// Search authors with role CREATOR
export const searchAuthors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req.query.q as string) || ""

    const authors = await prisma.user.findMany({
      where: {
        role: "CREATOR",
        OR: [
          { email: { contains: query.toLowerCase() } },
          { title: { contains: query.toLowerCase() } },
        ],
      },
      select: {
        id: true,
        email: true,
        title: true,
        bio: true,
        images: true,
      },
      take: 10,
    })

    res.json({ authors })
  } catch (error) {
    console.error("Error searching for authors:", error)
    next(error)
  }
}

// Search paintings by optional authorId
export const searchPainting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req.query.q as string) || ""
    const authorIdParam = req.params.authorId
    const authorId = authorIdParam ? parseInt(authorIdParam, 10) : undefined

    const paintings = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { title_en: { contains: query.toLowerCase() } },
              { description_en: { contains: query.toLowerCase() } },
              { title_uk: { contains: query.toLowerCase() } },
              { description_uk: { contains: query.toLowerCase() } },
            ],
          },
          ...(authorId !== undefined ? [{ authorId }] : []),
        ],
      },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            title: true,
            bio: true,
            images: true,
          },
        },
      },
      take: 10,
    })

    res.json({ paintings })
  } catch (error) {
    console.error("Error searching for paintings:", error)
    next(error)
  }
}

// Search museums with role MUSEUM
export const searchMuseum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req.query.q as string) || ""

    const museums = await prisma.user.findMany({
      where: {
        role: "MUSEUM",
        OR: [
          { email: { contains: query.toLowerCase() } },
          { title: { contains: query.toLowerCase() } },
          { bio: { contains: query.toLowerCase() } },
        ],
      },
      select: {
        id: true,
        email: true,
        title: true,
        bio: true,
        images: true,
        country: true,
        houseNumber: true,   // <-- corrected
        lat: true,
        lon: true,
        postcode: true,
        state: true,
        street: true,
        city: true,
      },
      take: 10,
    })

    res.json({ museums })
  } catch (error) {
    console.error("Error searching for museums:", error)
    next(error)
  }
}

// Comprehensive search across authors, products, posts, exhibitions
export const searchAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req.query.q as string) || ""
    const ql = query.toLowerCase()

    const searchAllAuthors = prisma.user.findMany({
      where: {
        role: { in: ["CREATOR", "MUSEUM", "EXHIBITION", "AUTHOR"] },
        OR: [
          { email: { contains: ql } },
          { title: { contains: ql } },
        ],
      },
      select: {
        id: true,
        email: true,
        title: true,
        bio: true,
        images: true,
        role: true,
      },
      take: 10,
    })

    const searchAllProduct = prisma.product.findMany({
      where: {
        OR: [
          { title_en: { contains: ql } },
          { description_en: { contains: ql } },
          { title_uk: { contains: ql } },
          { description_uk: { contains: ql } },
        ],
      },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            title: true,
            bio: true,
            images: true,
          },
        },
      },
      take: 10,
    })

    const searchAllPosts = prisma.post.findMany({
      where: {
        OR: [
          { title_en: { contains: ql } },
          { content_en: { contains: ql } },
          { title_uk: { contains: ql } },
          { content_uk: { contains: ql } },
        ],
      },
      select: {
        id: true,
        title_en: true,
        title_uk: true,
        images: true,
      },
      take: 10,
    })

    const searchAllExhibitions = prisma.exhibition.findMany({
      include: {
        images: true,
        museum: {
          include: {
            museumLogoImage: true,   // исправлено название поля
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            title: true,
          },
        },
        exhibitionArtists: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const [authors, products, posts, exhibitions] = await Promise.all([
      searchAllAuthors,
      searchAllProduct,
      searchAllPosts,
      searchAllExhibitions,
    ])

    res.json({ authors, products, posts, exhibitions })
  } catch (error) {
    console.error("Error in searchAll:", error)
    next(error)
  }
}

