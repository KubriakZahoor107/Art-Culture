// server/src/routes/exhibitionRoutes.ts

import { Router, Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";

import authenticateToken, { authorize } from "../middleware/authMiddleware";
import uploadExhibition from "../middleware/exhibitionImageUploader";

import {
  createExhibitions,
  getAllExhibitions,
  getExhibitionById,
  getMyExhibitions,
  getProductsByExhibitionId,    // <- тут була єдина форма
  updateExhibition,
  deleteExhibition,
} from "../controllers/exhibitionController";

const router = Router();

/**
 * POST /api/exhibitions
 */
router.post(
  "/",
  authenticateToken,
  authorize("MUSEUM", "CREATOR", "ADMIN", "EXHIBITION"),
  uploadExhibition.upload,
  uploadExhibition.processImages,

  body("title_en").notEmpty().withMessage("English title is required"),
  body("title_uk").notEmpty().withMessage("Ukrainian title is required"),
  body("description_en").notEmpty().withMessage("English description is required"),
  body("description_uk").notEmpty().withMessage("Ukrainian description is required"),

  // ручна перевірка express-validator
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },

  // ваш контролер
  asyncHandler(createExhibitions),
);

/**
 * GET /api/exhibitions
 */
router.get("/", asyncHandler(getAllExhibitions));

/**
 * GET /api/exhibitions/my-exhibitions
 */
router.get(
  "/my-exhibitions",
  authenticateToken,
  asyncHandler(getMyExhibitions),
);

/**
 * GET /api/exhibitions/:exhibitionId/products
 */
router.get(
  "/:exhibitionId/products",
  asyncHandler(getProductsByExhibitionId),  // <- узгоджена назва
);

/**
 * GET /api/exhibitions/:id
 */
router.get("/:id", asyncHandler(getExhibitionById));

/**
 * PUT /api/exhibitions/:id
 */
router.put(
  "/:id",
  authenticateToken,
  authorize("MUSEUM", "CREATOR", "ADMIN", "EXHIBITION"),
  uploadExhibition.upload,
  uploadExhibition.processImages,

  body("title_en").notEmpty().withMessage("Title is required"),
  body("title_uk").notEmpty().withMessage("Потрібен заголовок"),
  body("description_en").notEmpty().withMessage("Description is required"),
  body("description_uk").notEmpty().withMessage("Потрібен опис"),
  body("location_en").optional().isString(),
  body("location_uk").optional().isString(),
  body("artistIds")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error("artistIds must be an array");
        }
      }
      return true;
    }),
  body("time").optional().isString(),
  body("startDate").optional().isString(),
  body("endDate").optional().isString(),

  // ручна перевірка express-validator
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },

  asyncHandler(updateExhibition),
);

/**
 * DELETE /api/exhibitions/:id
 */
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(deleteExhibition),
);

export default router;
