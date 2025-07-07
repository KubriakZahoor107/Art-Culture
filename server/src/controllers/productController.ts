import prisma from "../prismaClient"
import { validationResult } from "express-validator"
import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { Request, Response, NextFunction } from "express"
import { AuthRequest } from "../middleware/authMiddleware"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export async function createProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

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
    const userId = req.user.id

    console.log("reg.user", req.user)

    const images = Array.isArray(req.files)
      ? req.files.map((file) => ({
          imageUrl: `../../uploads/productImages/${file.filename}`,
        }))
      : []

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
        images: {
          create: images,
        },
        author: { connect: { id: userId } },
      },
      include: {
        images: true,
      },
    })

    res.status(201).json({ product, message: "Product created successfully" })
  } catch (error) {
    console.error("Error creating product:", error)
    next(error)
  }
}
export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { authorIds } = req.query // Expecting 'authorIds=1,2,3'

    let products

    if (authorIds) {
      const ids =
        typeof authorIds === "string"
          ? authorIds.split(",")
          : Array.isArray(authorIds)
          ? authorIds
          : []
      const authorIdArray = ids.map((id) => parseInt(id as string, 10))

      // Validate that all IDs are numbers
      if (authorIdArray.some(isNaN)) {
        res.status(400).json({ error: "Invalid authorIds" })
        return
      }

      products = await prisma.product.findMany({
        where: {
          OR: [
            { authorId: { in: authorIdArray } },
            { museumId: { in: authorIdArray } },
          ],
        },
        include: {
          images: true,
          author: {
            select: {
              id: true,
              email: true,
              title: true,
            },
          },
        },
      })
    } else {
      // Fetch all products if no authorIds are provided
      products = await prisma.product.findMany({
        include: {
          images: true,
          author: {
            select: {
              id: true,
              email: true,
              title: true,
            },
          },
        },
      })
    }

    res.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    next(error)
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const productId = parseInt(req.params.productId, 10)
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" })
      return
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            title: true,
          },
        },
      },
    })

    if (!product) {
      res.status(404).json({ error: "Product not found" })
      return
    }

    res.json({ product })
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    next(error)
  }
}

export async function getUserProducts(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id

    console.log("getUserProducts - req.user:", req.user)

    const products = await prisma.product.findMany({
      where: {
        authorId: userId,
      },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            title: true,
          },
        },
      },
    })

    res.json({ products })
  } catch (error) {
    console.error("Error fetching user products:", error)
    next(error)
  }
}

export async function getCreatorProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      where: {
        author: {
          role: "CREATOR",
        },
      },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            title: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json({ products })
  } catch (error) {
    console.error("Error fetching creator products", error)
    next(error)
  }
}

export async function getProductByAuthorId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorId = parseInt(req.params.authorId, 10)
    if (isNaN(authorId)) {
      res.status(400).json({ error: "invalid product id" })
      return
    }
    const products = await prisma.product.findMany({
      where: {
        authorId: authorId,
      },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!products || products.length === 0) {
      res.status(404).json({ error: "Products not found" })
      return
    }

    res.json({ products }) // Wrap products in an object
  } catch (error) {
    console.error("Error fetching products by author ID:", error)
    next(error)
  }
}

export async function getMuseumProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      where: {
        author: {
          role: "MUSEUM",
        },
      },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            title: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json({ products })
  } catch (error) {
    console.error("Error fetching museum products", error)
    next(error)
  }
}

export async function getProductByMuseumId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const museumId = parseInt(req.params.museumId, 10)
    if (isNaN(museumId)) {
      res.status(400).json({ error: "invalid product id" })
      return
    }

    const products = await prisma.product.findMany({
      where: {
        authorId: museumId,
      },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            email: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    if (!products || products.length === 0) {
      res.status(404).json({ error: "Products not found" })
      return
    }

    res.json({ products }) // Wrap products in an object
  } catch (error) {
    console.error("Error fetching products by museum ID:", error)
    next(error)
  }
}

export async function updateProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params
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
    const userId = req.user.id

    // Verify ownership
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
      include: { images: true },
    })
    if (!product) {
      res.status(404).json({ error: "Paintings not found" })
      return
    }
    if (product.authorId !== userId) {
      res.status(403).json({ error: "Unauthorized" })
      return
    }

    let imagesData = []
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (let img of product.images) {
        const oldImagePath = path.join(__dirname, `../../${img.imageUrl}`)
        try {
          fs.unlinkSync(oldImagePath)
        } catch (err) {
          console.error("Error deleting images", err)
        }
      }
      await prisma.productImage.deleteMany({ where: { productId: product.id } })
      imagesData = req.files.map((file) => ({
        imageUrl: `../../uploads/productImages/${file.filename}`,
      }))
    }

    //Update product
    const updateProduct = await prisma.product.update({
      where: { id: parseInt(id) },
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
        images: {
          create: imagesData,
        },
      },
      include: {
        images: true,
        author: {
          select: { email: true, id: true },
        },
      },
    })

    res.json(updateProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    next(error)
  }
}

export async function deleteProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params
    const userId = req.user.id

    //Verify ownership
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
      include: { images: true },
    })
    if (!product) {
      res.status(404).json({ error: "Product not found" })
      return
    }
    if (product.authorId !== userId) {
      res.status(403).json({ error: "Unauthorized" })
      return
    }

    for (let img of product.images) {
      const imagePath = path.join(__dirname, `../../${img.imageUrl}`)
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        } else {
          console.error("File not found:", imagePath)
        }
      } catch (err) {
        console.error("Error deleting image", err)
      }
    }

    // Delete images from database
    await prisma.productImage.deleteMany({ where: { productId: product.id } })
    // Delete product
    await prisma.product.delete({ where: { id: parseInt(id) } })

    res.json({ message: "Product delete successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    next(error)
  }
}

export async function getProductByExhibitionId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exhibitionId = parseInt(req.params.exhibitionId, 10)
    if (isNaN(exhibitionId)) {
      res.status(400).json({ error: "Invalid exhibition ID" })
      return
    }

    const exhibition = await prisma.exhibition.findUnique({
      where: { id: exhibitionId },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
                author: true,
                museum: true,
              },
            },
          },
        },
      },
    })
    console.log("Exhibition and products data:", exhibition)
    if (!exhibition) {
      res.status(404).json({ error: "Exhibition not found" })
      return
    }

    const products = exhibition.products.map((ep) => ep.product)

    res.json({ products })
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    next(error)
  }
}
