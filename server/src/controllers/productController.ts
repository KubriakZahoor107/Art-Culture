// /Users/konstantinkubriak/Desktop/Art-Culture/server/src/controllers/productController.ts

import { Request, Response, NextFunction } from "express"
import multer, { FileFilterCallback } from "multer"
import { promises as fs } from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import prisma from "../prismaClient.js"
import { AuthRequest } from "../middleware/authMiddleware.js"
import { validationResult } from "express-validator"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "productImages")

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    // Тепер викликаємо тільки з помилкою — Multer припинить обробку
    cb(new Error("Only images allowed"))
  }
}

export const upload = multer({ storage, fileFilter })

// === CREATE ===
export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const userId = req.user!.id
    const {
      title_en,
      title_uk,
      description_en,
      description_uk,
      specs_en,
      specs_uk,
      size,
      dateOfCreation,
      style_en,
      style_uk,
      technique_en,
      technique_uk,
    } = req.body

    const imagesData =
      (req.files as Express.Multer.File[] | undefined)?.map((file) => ({
        imageUrl: path.join("uploads", "productImages", file.filename),
      })) ?? []

    const product = await prisma.product.create({
      data: {
        title_en,
        title_uk,
        description_en,
        description_uk,
        specs_en,
        specs_uk,
        size,
        dateOfCreation,
        style_en,
        style_uk,
        technique_en,
        technique_uk,
        status: "PENDING",
        images: { create: imagesData },
        author: { connect: { id: userId } },
      },
      include: { images: true },
    })

    res.status(201).json({ product, message: "Product created successfully" })
  } catch (err) {
    console.error("Error creating product:", err)
    next(err)
  }
}

// (інші контролери без змін…)
