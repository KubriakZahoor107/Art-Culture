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
  getExhibitionsPost,
  getMuseumsPost,
  getPostsByAuthorId,
  getPostByExhibitionId,
  getPostByMuseumId,
} from "../controllers/postController.js"
import { authenticateToken } from "../middleware/authMiddleware.js" // Змінено: імпортуємо authenticateToken як іменований експорт
import authorize from '../middleware/roleMiddleware.js'

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
router.get("/exhibitions", getExhibitionsPost)
router.get("/museums", getMuseumsPost)

// Фільтрація по конкретному exhibition або museum
router.get("/exhibition/:exhibitionId", getPostByExhibitionId)
router.get("/museum/:museumId", getPostByMuseumId)

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
