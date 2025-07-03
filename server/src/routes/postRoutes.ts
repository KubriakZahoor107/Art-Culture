import express from "express"
import { body } from "express-validator"
import {
  createPost,
  deletePost,
  getAllPosts,
  getAuthorsPosts,
  getCreatorsPosts,
  getExhibitionsPost,
  getMuseumsPost,
  getPostByExhibitionId,
  getPostById,
  getPostByMuseumId,
  getPostsByAuthorId,
  updatePost,
  upload,
} from "../controllers/postController"
import authenticateToken from "../middleware/authMiddleware"
import { logPostActions } from "../middleware/postMiddleware"

const router = express.Router()

// Create a new post
router.post(
  "/",
  authenticateToken,
  logPostActions,
  upload.single("images"),
  [
    body("title_en").notEmpty().withMessage("Title is required"),
    body("content_en").notEmpty().withMessage("Content is required"),
    body("title_uk").notEmpty().withMessage("Потрібен заголовок"),
    body("content_uk").notEmpty().withMessage("Потрібен опис"),
  ],
  createPost,
)

// Get post by Creator
router.get("/creators", getCreatorsPosts)

router.get("/creator/:authorId", getPostsByAuthorId)

router.get("/authors", getAuthorsPosts)

router.get("/author/:authorId", getPostsByAuthorId)

router.get("/exhibitions", getExhibitionsPost)

router.get("/exhibitions/by-author/:authorId", getPostsByAuthorId)

router.get("/exhibitions/:id", getPostByExhibitionId)

router.get("/museums", getMuseumsPost)

// Get posts by museum author
router.get("/museum/by-author/:authorId", getPostsByAuthorId)

router.get("/museum/:museumId", getPostByMuseumId)

// Get all posts
router.get("/", getAllPosts)

// Get a single post by ID
router.get("/:id", getPostById)

// Update a post
router.put(
  "/:id",
  authenticateToken,
  upload.single("images"),
  [
    body("title_en").notEmpty().withMessage("Title is required"),
    body("content_en").notEmpty().withMessage("Content is required"),
    body("title_uk").notEmpty().withMessage("Потрібен заголовок"),
    body("content_uk").notEmpty().withMessage("Потрібен опис"),
  ],
  updatePost,
)

// Delete a post
router.delete("/:id", authenticateToken, deletePost)

export default router
