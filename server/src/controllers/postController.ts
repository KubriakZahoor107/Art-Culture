import { Prisma } from "@prisma/client" // ЗМІНЕНО: import type на import
import { Request, Response, NextFunction } from "express"
import multer, { FileFilterCallback } from "multer"
import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import prisma from "../prismaClient.js"
import logger from "../utils/logging.js"

// 🛠 Підготовка __dirname для ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 📦 Налаштування Multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, "../../uploads", "postImages")
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const allowed = /\.(jpe?g|png|gif|webp)$/i
  if (allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only images are allowed"))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

// === CREATE POST ===
export const createPost = async (
  req: Request & { file?: Express.Multer.File; user?: { id: number } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const userId = req.user.id
    const { title_en, title_uk, content_en, content_uk, creatorId, exhibitionId, museumId } = req.body as {
      title_en: string
      title_uk?: string
      content_en: string
      content_uk?: string
      creatorId?: number
      exhibitionId?: number
      museumId?: number
    }

    let imageUrl: string | null = null
    if (req.file) {
      imageUrl = `/uploads/postImages/${req.file.filename}`
    }

    // Будуємо об'єкт, додаючи необов'язкові поля тільки якщо вони задані
    const postData: Prisma.PostCreateInput = {
      title_en,
      content_en,
      // Використовуємо тернарний оператор для явного присвоєння Prisma.JsonNull або string
      images: imageUrl === null ? Prisma.JsonNull : (imageUrl as Prisma.InputJsonValue),
      status: "PENDING",
      author: { connect: { id: userId } },
      ...(title_uk && { title_uk }), // Тепер title_uk є String? у схемі
      ...(content_uk && { content_uk }), // Тепер content_uk є String? у схемі
      ...(creatorId && { creatorId }),
      ...(exhibitionId && { exhibitionId }),
      ...(museumId && { museumId }),
    }

    const post = await prisma.post.create({
      data: postData,
      include: { author: { select: { id: true, email: true, title: true } } },
    })

    res.status(201).json(post)
  } catch (err) {
    next(err)
  }
}

// === READ ALL APPROVED POSTS ===
export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorId = req.query.authorId as string | undefined
    const filter = authorId ? { authorId: parseInt(authorId, 10) } : {}

    const posts = await prisma.post.findMany({
      where: { status: "APPROVED", ...filter },
      include: { author: { select: { id: true, email: true, title: true } } },
      orderBy: { createdAt: "desc" },
    })

    res.json(posts)
  } catch (err: any) {
    if (err.code === "P2021") {
      res.json({ posts: [] })
      return
    }
    next(err)
  }
}

// === READ POST BY ID ===
export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid post ID" })
      return
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, email: true, title: true } } },
    })
    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }

    res.json(post)
  } catch (err) {
    next(err)
  }
}

// === UPDATE POST ===
export const updatePost = async (
  req: Request & { file?: Express.Multer.File; user?: { id: number } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const id = parseInt(req.params.id, 10)
    const userId = req.user.id

    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: "Post not found" })
      return
    }
    if (existing.authorId !== userId) {
      res.status(403).json({ error: "Unauthorized" })
      return
    }

    let newImageUrl: string | null = null
    if (req.file) {
      // Видаляємо старе зображення, якщо воно існує і є дійсним шляхом
      if (existing.images !== null && existing.images !== undefined) {
        try {
          // existing.images є JsonValue, тому потрібно перетворити на string
          const imagePathInDb = existing.images as string; // Припускаємо, що це JSON-рядок, який ми зберігали
          const oldImagePath = path.join(__dirname, "../../uploads", imagePathInDb);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (e) {
          logger.error(`Error deleting old image for post ${id}:`, e);
        }
      }
      newImageUrl = `/uploads/postImages/${req.file.filename}`
    } else {
      newImageUrl = existing.images as string | null; // Зберігаємо існуюче зображення, якщо нове не завантажено
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title_en: req.body.title_en,
        title_uk: req.body.title_uk ?? null, // Використовуємо ?? null для необов'язкових полів
        content_en: req.body.content_en,
        content_uk: req.body.content_uk ?? null, // Використовуємо ?? null для необов'язкових полів
        // Використовуємо тернарний оператор для явного присвоєння Prisma.JsonNull або string
        images: newImageUrl === null ? Prisma.JsonNull : (newImageUrl as Prisma.InputJsonValue),
      },
      include: { author: { select: { id: true, email: true, title: true } } },
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
}

// === DELETE POST ===
export const deletePost = async (
  req: Request & { user?: { id: number } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const id = parseInt(req.params.id, 10)
    const userId = req.user.id

    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: "Post not found" })
      return
    }
    if (existing.authorId !== userId) {
      res.status(403).json({ error: "Unauthorized" })
      return
    }

    if (existing.images !== null && existing.images !== undefined) {
      try {
        const imagePathInDb = existing.images as string; // Припускаємо, що це JSON-рядок, який ми зберігали
        const oldImagePath = path.join(__dirname, "../../uploads", imagePathInDb);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (e) {
        logger.error(`Error deleting old image for post ${id}:`, e);
      }
    }

    await prisma.post.delete({ where: { id } })
    res.json({ message: "Post deleted successfully" })
  } catch (err) {
    next(err)
  }
}

// === GET POSTS BY ROLE ===
export function makeRoleFinder(
  role: "CREATOR" | "AUTHOR" | "EXHIBITION" | "MUSEUM"
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await prisma.post.findMany({
        where: { author: { role } },
        include: { author: { select: { id: true, email: true, title: true } } },
        orderBy: { createdAt: "desc" },
      })
      res.json({ posts })
    } catch (err: any) {
      if (err.code === "P2021") {
        res.json({ posts: [] })
        return
      }
      logger.error(`Error fetching ${role} posts:`, err)
      next(err)
    }
  }
}

// === GET POSTS BY PARAMETER ===
export function makeByParamFinder(
  param: "authorId" | "exhibitionId" | "museumId",
  alias: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt((req.params as any)[param], 10)
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid ID" })
        return
      }
      const posts = await prisma.post.findMany({
        where: { [param]: id },
        include: {
          author: { select: { id: true, email: true, title: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      })
      res.json({ [alias]: posts })
    } catch (err: any) {
      if (err.code === "P2021") {
        res.json({ [alias]: [] })
        return
      }
      next(err)
    }
  }
}

// === EXPORT ROUTES ===
export const getCreatorsPosts = makeRoleFinder("CREATOR")
export const getAuthorsPosts = makeRoleFinder("AUTHOR")
export const getExhibitionsPost = makeRoleFinder("EXHIBITION")
export const getMuseumsPost = makeRoleFinder("MUSEUM")

export const getPostsByAuthorId = makeByParamFinder(
  "authorId",
  "postsByAuthor"
)
export const getPostByExhibitionId = makeByParamFinder(
  "exhibitionId",
  "postsByExhibition"
)
export const getPostByMuseumId = makeByParamFinder(
  "museumId",
  "postsByMuseum"
)
