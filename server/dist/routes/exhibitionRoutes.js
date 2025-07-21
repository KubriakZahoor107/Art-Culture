import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/authMiddleware.js"; // Змінено: імпортуємо authenticateToken як іменований експорт
import authorize from '../middleware/roleMiddleware.js';
import uploadExhibition from "../middleware/exhibitionImageUploader.js";
import { createExhibitions, getAllExhibitions, getExhibitionById, getMyExhibitions, getProductsByExhibitionId, updateExhibition, deleteExhibition, } from "../controllers/exhibitionController.js";
const router = Router();
/**
 * POST /api/exhibitions
 */
router.post("/", authenticateToken, authorize("MUSEUM", "CREATOR", "ADMIN", "EXHIBITION"), uploadExhibition.upload, uploadExhibition.processImages, 
// Валідація полів
body("title_en").notEmpty().withMessage("English title is required"), body("title_uk").notEmpty().withMessage("Ukrainian title is required"), body("description_en").notEmpty().withMessage("English description is required"), body("description_uk").notEmpty().withMessage("Ukrainian description is required"), body("date").isISO8601().withMessage("Date must be valid"), 
// Ручна перевірка результатів валідації
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, asyncHandler(createExhibitions));
/**
 * GET /api/exhibitions
 */
router.get("/", asyncHandler(getAllExhibitions));
/**
 * GET /api/exhibitions/my-exhibitions
 */
router.get("/my-exhibitions", authenticateToken, asyncHandler(getMyExhibitions));
/**
 * GET /api/exhibitions/:exhibitionId/products
 */
router.get("/:exhibitionId/products", asyncHandler(getProductsByExhibitionId));
/**
 * GET /api/exhibitions/:id
 */
router.get("/:id", asyncHandler(getExhibitionById));
/**
 * PUT /api/exhibitions/:id
 */
router.put("/:id", authenticateToken, authorize("MUSEUM", "CREATOR", "ADMIN", "EXHIBITION"), uploadExhibition.upload, uploadExhibition.processImages, body("title_en").notEmpty().withMessage("Title is required"), body("title_uk").notEmpty().withMessage("Потрібен заголовок"), body("description_en").notEmpty().withMessage("Description is required"), body("description_uk").notEmpty().withMessage("Потрібен опис"), body("location_en").optional().isString(), body("location_uk").optional().isString(), body("artistIds")
    .optional()
    .custom((value) => {
    if (typeof value === "string") {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            throw new Error("artistIds must be an array");
        }
    }
    return true;
}), body("time").optional().isString(), body("startDate").optional().isString(), body("endDate").optional().isString(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, asyncHandler(updateExhibition));
/**
 * DELETE /api/exhibitions/:id
 */
router.delete("/:id", authenticateToken, asyncHandler(deleteExhibition));
export default router;
//# sourceMappingURL=exhibitionRoutes.js.map