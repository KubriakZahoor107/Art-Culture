// server/src/routes/postRoutes.ts
import express from 'express';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
  getCreatorsPosts,
  getAuthorsPosts,
  getExhibitionsPost,
  getMuseumsPost,
  getPostsByAuthorId,
  getPostByExhibitionId,
  getPostByMuseumId,
  upload,
} from '../controllers/postController';

import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

// CREATE POST
router.post('/', authenticateToken, upload.single('image'), createPost);

// GET ALL APPROVED POSTS (optional filter by authorId)
router.get('/', getAllPosts);

// GET POST BY ID
router.get('/:id', getPostById);

// UPDATE POST
router.put('/:id', authenticateToken, upload.single('image'), updatePost);

// DELETE POST
router.delete('/:id', authenticateToken, deletePost);

// GET POSTS BY ROLE
router.get('/creators', getCreatorsPosts);
router.get('/authors', getAuthorsPosts);
router.get('/exhibitions', getExhibitionsPost);
router.get('/museums', getMuseumsPost);

// GET POSTS BY ENTITY ID
router.get('/by-author/:authorId', getPostsByAuthorId);
router.get('/by-exhibition/:exhibitionId', getPostByExhibitionId);
router.get('/by-museum/:museumId', getPostByMuseumId);

export default router;
