import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  resetPassword,
  resetPasswordConfirm,
  getCurrentUser,
  updateUserProfile
} from '../controllers/authController';
import authenticateToken from '../middleware/authMiddleware';
import authorize from '../middleware/roleMIddleware';
import { uploadProfileLogoImages, processProfileLogoImages } from '../middleware/uploadProfileLogoImages';

const router = express.Router();

// Registration Route with Validation
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
    body('country').if(body('role').equals('MUSEUM')).notEmpty().withMessage('Country is required for museums'),
    body('city').if(body('role').equals('MUSEUM')).notEmpty().withMessage('State is required for museums'),
    body('street').if(body('role').equals('MUSEUM')).notEmpty().withMessage('Street is required for museums'),
    body('house_number').if(body('role').equals('MUSEUM')).notEmpty().withMessage('House number is required for museums'),
    body('postcode').if(body('role').equals('MUSEUM')).notEmpty().withMessage('Postcode is required for museums'),
    body('lat').if(body('role').equals('MUSEUM')).isFloat().withMessage('Latitude must be a valid number'),
    body('lon').if(body('role').equals('MUSEUM')).isFloat().withMessage('Longitude must be a valid number'),
  ],
  register
);

// Self registration by admin
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
);

// Login Route
router.post('/login', login);

// Password reset request
router.post('/reset-password', resetPassword);

// Password reset confirmation
router.post('/reset-password/:token', resetPasswordConfirm);

router.get('/me', authenticateToken, getCurrentUser);

router.put(
  '/me',
  authenticateToken,
  uploadProfileLogoImages,
  processProfileLogoImages,
  [
    body('title').optional().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
    body('bio').optional().isLength({ max: 1500 }).withMessage('Bio must be less than 500 characters'),
  ],
  updateUserProfile
);

export default router;
