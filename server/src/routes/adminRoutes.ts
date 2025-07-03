import express from "express"
import {
  approveProduct,
  getPendingCounts,
  getPendingProducts,
  rejectProduct,
} from "../controllers/adminController"
import {
  registerAdminPostRoutes,
} from "../controllers/adminPostsController"
import {
  registerAdminUserRoutes,
} from "../controllers/adminUsersController"
import authenticateToken from "../middleware/authMiddleware"
import authorize from "../middleware/roleMIddleware"

const router = express.Router()

router.get(
  "/pending-counts",
  authenticateToken,
  authorize("ADMIN"),
  getPendingCounts,
)

router.get(
  "/pending-products",
  authenticateToken,
  authorize("ADMIN"),
  getPendingProducts,
)

registerAdminPostRoutes(router);
registerAdminUserRoutes(router);

router.patch(
  "/products/:id/approve",
  authenticateToken,
  authorize("ADMIN"),
  approveProduct,
)
router.patch(
  "/products/:id/reject",
  authenticateToken,
  authorize("ADMIN"),
  rejectProduct,
)

export default router
