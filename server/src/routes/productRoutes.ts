// File: /Users/konstantinkubriak/Desktop/Art-Culture/server/src/routes/productRoutes.ts

import express from "express"
import {
  createProduct,
  getProducts,
  getProductById,
  getUserProducts,
  getCreatorProducts,
  getProductByAuthorId,
  getMuseumProducts,
  getProductByMuseumId,
  getProductByExhibitionId,
  updateProduct,
  // deleteProduct,  // Видалено, бо у контролері немає експорту deleteProduct
} from "../controllers/productController.js"
import authenticateToken from "../middleware/authMiddleware.js"
import authorize from "../middleware/roleMiddleware.js"
import uploadPaintings from "../middleware/productImageUploader.js"

const router = express.Router()

// CREATE (Museum & Creator)
router.post(
  "/",
  authenticateToken,
  authorize("MUSEUM", "CREATOR", "ADMIN"),
  uploadPaintings.array("productImages", 7),
  createProduct,
)

// READ
router.get("/creators-products", getCreatorProducts)
router.get("/", getProducts)
router.get("/my-products", authenticateToken, getUserProducts)
router.get("/author/:authorId", getProductByAuthorId)
router.get("/museum-products", getMuseumProducts)
router.get("/museum/:museumId", getProductByMuseumId)
router.get("/exproducts", getProductByExhibitionId)
router.get("/:productId", getProductById)

// UPDATE
router.put(
  "/:id",
  authenticateToken,
  authorize("MUSEUM", "CREATOR", "ADMIN"),
  uploadPaintings.array("productImages", 7),
  updateProduct,
)

// DELETE (якщо в контролері захочете додати видалення — розкоментуйте)
// router.delete("/:id", authenticateToken, deleteProduct)

export default router
