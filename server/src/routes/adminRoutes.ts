import express from "express"
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} from "../controllers/adminController.js"
import { authenticateToken } from "../middleware/authMiddleware.js" // Змінено: імпортуємо authenticateToken як іменований експорт
import authorize from '../middleware/roleMiddleware.js'
const router = express.Router()

// Усі admin-маршрути під цим префіксом захищені
router.use(authenticateToken, authorize("ADMIN"))

// GET /admin/users — повернути всіх користувачів
router.get("/admin/users", getAllUsers)

// GET /admin/users/:id — повернути одного
router.get("/admin/users/:id", getUserById)

// PUT /admin/users/:id — оновити
router.put("/admin/users/:id", updateUser)

// DELETE /admin/users/:id — видалити
router.delete("/admin/users/:id", deleteUser)

export default router