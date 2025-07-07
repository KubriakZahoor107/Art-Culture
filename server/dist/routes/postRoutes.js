// server/src/routes/postRoutes.ts
import express from 'express';
import { createPost, deletePost, getAllPosts, getPostById, updatePost, getCreatorsPosts, getAuthorsPosts, getExhibitionsPosts, getMuseumsPosts, getPostsByAuthorId, getPostsByExhibitionId, getPostsByMuseumId, upload, } from '../controllers/postController.js';
import authenticateToken from '../middleware/authMiddleware.js';
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
router.get('/exhibitions', getExhibitionsPosts);
router.get('/museums', getMuseumsPosts);
// GET POSTS BY ENTITY ID
router.get('/by-author/:authorId', getPostsByAuthorId);
router.get('/by-exhibition/:exhibitionId', getPostsByExhibitionId);
router.get('/by-museum/:museumId', getPostsByMuseumId);
export default router;
