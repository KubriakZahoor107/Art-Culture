// server/src/routes/adminRoutes.ts
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
// middleware
import authenticateToken, { authorize } from "../middleware/authMiddleware.js";
// контролери для адмін-постів
import { getAllAdminPosts, getPendingPosts, approvePost, rejectPost, } from "../controllers/adminPostsController.js";
const router = Router();
// GET /api/admin/pending-posts
router.get("/pending-posts", authenticateToken, authorize("ADMIN"), asyncHandler(getPendingPosts));
// GET /api/admin/posts
router.get("/posts", authenticateToken, authorize("ADMIN"), body("page").optional().isInt({ min: 1 }), body("pageSize").optional().isInt({ min: 1, max: 20 }), body("orderBy").optional().isIn(["createdAt", "title", "status"]), body("orderDir").optional().isIn(["asc", "desc"]), body("status").optional().isIn(["PENDING", "APPROVED", "REJECTED"]), body("authorId").optional().isInt(), asyncHandler(getAllAdminPosts));
// PATCH /api/admin/posts/:id/approve
router.patch("/posts/:id/approve", authenticateToken, authorize("ADMIN"), asyncHandler(approvePost));
// PATCH /api/admin/posts/:id/reject
router.patch("/posts/:id/reject", authenticateToken, authorize("ADMIN"), asyncHandler(rejectPost));
export default router;
