/// server/src/routes/artTermsRoutes.ts
import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js' // Змінено: імпортуємо authenticateToken як іменований експорт
import authorize from '../middleware/roleMiddleware.js'
import asyncHandler from 'express-async-handler'

import {
	getArtTermsByLang,
	getLastArtTerms,
	getArtTermsByLetter,
	getArtTermById,
	getPagesArtTerms,
} from '../controllers/artTermsController.js'

const router = express.Router()

/**
 * GET /api/art-terms/letters/:lang
 * Список термінів для конкретної мови, фільтр за першою літерою
 */
router.get(
	'/letters/:lang',
	asyncHandler(getArtTermsByLang)
)

/**
 * GET /api/art-terms/last-terms/:lang
 * Останні додані терміни за мовою
 */
router.get(
	'/last-terms/:lang',
	asyncHandler(getLastArtTerms)
)

/**
 * GET /api/art-terms/pages
 * Пагінований список термінів (адмінська частина)
 */
router.get(
	'/pages',
	authenticateToken,
	authorize('ADMIN'),
	asyncHandler(getPagesArtTerms)
)

/**
 * GET /api/art-terms/by-letter/:letter
 * Термін за точною літерою
 */
router.get(
	'/by-letter/:letter',
	asyncHandler(getArtTermsByLetter)
)

/**
 * GET /api/art-terms/:id
 * Повернути один термін за ID
 */
router.get(
	'/:id',
	asyncHandler(getArtTermById)
)

export default router
