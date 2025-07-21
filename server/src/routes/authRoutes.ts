// File: /Users/konstantinkubriak/Desktop/Art-Culture/server/src/routes/authRoutes.ts

import express from 'express'
import { body } from 'express-validator'
import {
  register,
  login,
  resetPassword,
  resetPasswordConfirm,
  getCurrentUser,
  updateUserProfile,
} from '../controllers/authController.js'
import { authenticateToken } from '../middleware/authMiddleware.js' // Змінено: імпортуємо authenticateToken як іменований експорт
import authorize from '../middleware/roleMiddleware.js'
import {
  uploadProfileLogoImages,
  processProfileLogoImages,
} from '../middleware/uploadProfileLogoImages.js'

const router = express.Router()

// ── PUBLIC AUTH ROUTES ───────────────────────────────────────────────────

router.post(
  '/register',
  uploadProfileLogoImages,
  processProfileLogoImages,
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'USER', 'MUSEUM', 'CREATOR', 'EDITOR', 'AUTHOR', 'EXHIBITION'])
      .withMessage('Invalid role'),
    body('country')
      .if(body('role').equals('MUSEUM'))
      .notEmpty()
      .withMessage('Country is required for museums'),
    body('city')
      .if(body('role').equals('MUSEUM'))
      .notEmpty()
      .withMessage('City is required for museums'),
    body('street')
      .if(body('role').equals('MUSEUM'))
      .notEmpty()
      .withMessage('Street is required for museums'),
    body('house_number')
      .if(body('role').equals('MUSEUM'))
      .notEmpty()
      .withMessage('House number is required for museums'),
    body('postcode')
      .if(body('role').equals('MUSEUM'))
      .notEmpty()
      .withMessage('Postcode is required for museums'),
    body('lat')
      .if(body('role').equals('MUSEUM'))
      .isFloat()
      .withMessage('Latitude must be a valid number'),
    body('lon')
      .if(body('role').equals('MUSEUM'))
      .isFloat()
      .withMessage('Longitude must be a valid number'),
  ],
  register,
)

router.post(
  '/signup',
  authenticateToken,
  authorize('ADMIN'),
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register,
)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login,
)

router.post('/reset-password', resetPassword)
router.post('/reset-password/:token', resetPasswordConfirm)

// ── PROTECTED USER ROUTES ─────────────────────────────────────────────────

router.get('/me', authenticateToken, getCurrentUser)

router.put(
  '/me',
  authenticateToken,
  uploadProfileLogoImages,
  processProfileLogoImages,
  [
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Title must be less than 100 characters'),
    body('bio')
      .optional()
      .isLength({ max: 1500 })
      .withMessage('Bio must be less than 1500 characters'),
  ],
  updateUserProfile,
)

// ── ADMIN-ONLY ROUTES ─────────────────────────────────────────────────────

router.use(authenticateToken, authorize('ADMIN'))
// тут можна додати додаткові admin-маршрути

export default router
