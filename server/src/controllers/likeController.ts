import { Request, Response } from 'express'
import prisma from '../prismaClient.js'

const getLikeField = (entityType: string): 'postId' | 'productId' | 'exhibitionId' | 'likedUserId' | null => {
  switch (entityType) {
    case 'post':
      return 'postId'
    case 'product':
      return 'productId'
    case 'exhibition':
      return 'exhibitionId'
    case 'user':
    case 'creator':
    case 'museum':
      return 'likedUserId'
    default:
      return null
  }
}

export const toggleLikeEntity = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id
    const { entityId, entityType } = req.body
    const idNum = parseInt(entityId, 10)
    const field = getLikeField(entityType)

    if (!field || isNaN(idNum)) {
      return res.status(400).json({ error: 'Invalid parameters' })
    }

    const where = { userId, [field]: idNum }
    const existing = await prisma.like.findFirst({ where })

    let liked = false
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
    } else {
      await prisma.like.create({ data: where })
      liked = true
    }

    const likeCount = await prisma.like.count({ where: { [field]: idNum } })
    return res.status(200).json({ liked, likeCount })
  } catch (error) {
    console.error('Error toggling like:', error)
    return res.status(500).json({ error: 'Failed to toggle like' })
  }
}

export const getLikeStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || null
    const { entityId, entityType } = req.query
    const idNum = parseInt(entityId as string, 10)
    const field = getLikeField(entityType as string)

    if (!field || isNaN(idNum)) {
      return res.status(400).json({ error: 'Invalid parameters' })
    }

    const likeCount = await prisma.like.count({ where: { [field]: idNum } })
    let liked = false
    if (userId) {
      liked = Boolean(
        await prisma.like.findFirst({
          where: { userId, [field]: idNum },
        })
      )
    }
    return res.status(200).json({ liked, likeCount })
  } catch (error) {
    console.error('Error fetching like status:', error)
    return res.status(500).json({ error: 'Failed to fetch like status' })
  }
}

export const getLikeCount = async (req: Request, res: Response) => {
  try {
    const { entityId, entityType } = req.query
    const idNum = parseInt(entityId as string, 10)
    const field = getLikeField(entityType as string)

    if (!field || isNaN(idNum)) {
      return res.status(400).json({ error: 'Invalid parameters' })
    }

    const likeCount = await prisma.like.count({ where: { [field]: idNum } })
    return res.status(200).json({ likeCount })
  } catch (error) {
    console.error('Error fetching like count:', error)
    return res.status(500).json({ error: 'Failed to fetch like count' })
  }
}

export const getTopLikedPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: { _count: { select: { likes: true } } },
      orderBy: { likes: { _count: 'desc' } },
      take: 10,
    })
    return res.json(posts)
  } catch (error) {
    console.error('Error fetching top liked posts:', error)
    return res.status(500).json({ error: 'Failed to fetch top liked posts' })
  }
}

export const getTopLikedMuseums = async (req: Request, res: Response) => {
  try {
    const museums = await prisma.user.findMany({
      where: { role: 'MUSEUM' },
      include: { _count: { select: { likesReceived: true } } },
      orderBy: { likesReceived: { _count: 'desc' } },
      take: 10,
    })
    return res.json(museums)
  } catch (error) {
    console.error('Error fetching top liked museums:', error)
    return res.status(500).json({ error: 'Failed to fetch top liked museums' })
  }
}

export const getTopLikedExhibitions = async (req: Request, res: Response) => {
  try {
    const exhibitions = await prisma.exhibition.findMany({
      include: { images: true, _count: { select: { likes: true } } },
      orderBy: { likes: { _count: 'desc' } },
      take: 10,
    })
    return res.json(exhibitions)
  } catch (error) {
    console.error('Error fetching top liked exhibitions:', error)
    return res.status(500).json({ error: 'Failed to fetch top liked exhibitions' })
  }
}

export const getTopLikedPaintings = async (req: Request, res: Response) => {
  try {
    const paintings = await prisma.product.findMany({
      include: { images: true, _count: { select: { likes: true } } },
      orderBy: { likes: { _count: 'desc' } },
      take: 10,
    })
    return res.json(paintings)
  } catch (error) {
    console.error('Error fetching top liked paintings:', error)
    return res.status(500).json({ error: 'Failed to fetch top liked paintings' })
  }
}
