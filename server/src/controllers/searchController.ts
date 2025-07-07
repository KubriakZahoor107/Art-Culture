import { Request, Response, NextFunction } from "express"
import prisma from "../prismaClient.js"
export async function searchAuthors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q ?? ""

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
      take: 10, //Limit request
    })
    res.json({ authors })
  } catch (error) {
    console.error("Error searching for authors:", error)
    next(error)
  }
}

export async function searchPainting(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q ?? ""
    const authorId = req.params.authorId
      ? parseInt(req.params.authorId, 10)
      : null

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
          authorId ? { authorId: authorId } : {},
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
      take: 10, //Limit request
    })

    res.json({ paintings })
  } catch (error) {
    console.error("Error searching for paintings:", error)
    next(error)
  }
}

export async function searchMuseum(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q ?? ""

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
        house_number: true,
        lat: true,
        lon: true,
        postcode: true,
        state: true,
        street: true,
        city: true,
      },
      take: 10, //Limit request
    })
    res.json({ museums })
  } catch (error) {
    console.error("Error searching for museums:", error)
    next(error)
  }
}

// controllers/searchController.js
export async function searchAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q ?? ""

    // Search for authors (fixing the typo: "contains" instead of "contain")
    const searchAllAuthors = await prisma.user.findMany({
      where: {
        role: { in: ["CREATOR", "MUSEUM", "EXHIBITION", "AUTHOR"] }, // Removed duplicate "MUSEUM"
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
        role: true,
      },
      take: 10,
    })

    // Search for products (remove reference to undefined museumId)
    const searchAllProduct = await prisma.product.findMany({
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
          // Remove or modify the authorId condition if not needed
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

    const searchAllPosts = await prisma.post.findMany({
      where: {
        OR: [
          { title_en: { contains: query.toLowerCase() } },
          { content_en: { contains: query.toLowerCase() } },
          { title_uk: { contains: query.toLowerCase() } },
          { content_uk: { contains: query.toLowerCase() } },
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

    const searchAllExhibitions = await prisma.exhibition.findMany({
      include: {
        images: true,
        museum: {
          include: {
            museumLogoImage: true,
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

    res.json({
      searchAllAuthors,
      searchAllProduct,
      searchAllPosts,
      searchAllExhibitions,
    })
  } catch (error) {
    console.error("error in searchAll", error)
    next(error)
  }
}
