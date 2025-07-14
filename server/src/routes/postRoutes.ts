// File: /Users/konstantinkubriak/Desktop/Art-Culture/server/src/routes/postRoutes.ts

import express from "express"
import {
  upload,
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getCreatorsPosts,
  getAuthorsPosts,
  getExhibitionsPosts,
  getMuseumsPosts,
  getPostsByAuthorId,
  getPostsByExhibitionId,
  getPostsByMuseumId,
} from "../controllers/postController.js"
import authenticateToken from "../middleware/authMiddleware.js"
import authorize from "../middleware/roleMiddleware.js"

const router = express.Router()

// ── PUBLIC POSTS ──────────────────────────────────────────────────────────
router.get("/", getAllPosts)
router.get("/:id", getPostById)

// Фільтрація по ролі автора
router.get("/creators", getCreatorsPosts)
router.get("/authors", getAuthorsPosts)

// Фільтрація по конкретному автору
router.get("/author/:authorId", getPostsByAuthorId)

// Фільтрація по ролі exhibition та museum
router.get("/exhibitions", getExhibitionsPosts)
router.get("/museums", getMuseumsPosts)

// Фільтрація по конкретному exhibition або museum
router.get("/exhibition/:exhibitionId", getPostsByExhibitionId)
router.get("/museum/:museumId", getPostsByMuseumId)

// ── PROTECTED POSTS ───────────────────────────────────────────────────────
router.use(authenticateToken)

// Створення, оновлення, видалення — лише ADMIN чи EDITOR
router.post(
  "/",
  authorize("ADMIN", "EDITOR"),
  upload.single("file"),
  createPost,
)

router.put(
  "/:id",
  authorize("ADMIN", "EDITOR"),
  upload.single("file"),
  updatePost,
)

router.delete(
  "/:id",
  authorize("ADMIN", "EDITOR"),
  deletePost,
)

export default router

