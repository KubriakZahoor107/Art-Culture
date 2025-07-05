// server/src/controllers/authController.ts
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

import prisma from '../prismaClient.js';
import generateToken from '../utils/generateToken.js';
import logger from '../utils/logging.js';
import sendEmail from '../utils/sendEmails.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MuseumFields {
  country?: string | null;
  city?: string | null;
  street?: string | null;
  house_number?: string | null;
  postcode?: string | null;
  lat?: number | null;
  lon?: number | null;
}

// Допоміжна функція
function applyMuseumFields(
  target: Record<string, any>,
  source: MuseumFields
): void {
  const stringFields: Array<keyof MuseumFields> = [
    'country',
    'city',
    'street',
    'house_number',
    'postcode',
  ];
  const numericFields: Array<keyof MuseumFields> = ['lat', 'lon'];

  for (const f of stringFields) {
    target[f] = source[f] ?? null;
  }
  for (const f of numericFields) {
    const raw = source[f];
    target[f] = raw != null ? parseFloat(String(raw)) : null;
  }
}

/**
 * Реєстрація (ADMIN)
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      role = 'USER',
      title,
      bio,
      country,
      city,
      street,
      house_number,
      postcode,
      lat,
      lon,
    } = req.body as Record<string, any>;

    if (await prisma.user.count({ where: { email } })) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userData: Record<string, any> = {
      email,
      password: hashed,
      images: req.body.profileImagePath ?? null,
      role,
      title,
      bio,
    };

    if (role === 'MUSEUM') {
      applyMuseumFields(userData, { country, city, street, house_number, postcode, lat, lon });
    }

    const user = await prisma.user.create({ data: userData });

    if (role === 'MUSEUM' && req.body.museumLogoPath) {
      await prisma.museum_logo_images.create({
        data: { imageUrl: req.body.museumLogoPath, userId: user.id },
      });
    }

    await sendEmail(
      user.email,
      'Підтвердження реєстрації',
      `Дякуємо за реєстрацію на ArtPlayUkraine.`,
      `<p>Дякуємо за реєстрацію на ArtPlayUkraine. <a href="${process.env.CLIENT_URL}">Перейти до сайту</a></p>`
    );

    const token = generateToken(user);
    const { password: _pwd, ...userWithoutPassword } = user;
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

/**
 * Самостійна реєстрація (USER)
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body as { email: string; password: string };
    if (await prisma.user.count({ where: { email } })) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, role: 'USER' },
    });

    const token = generateToken(user);
    const { password: _pwd, ...userWithoutPassword } = user;
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

/**
 * Логін
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const { password: _pwd, ...userWithoutPassword } = user;
    return res.json({ token, user: userWithoutPassword });
  } catch (err) {
    logger.error('Login error:', err);
    next(err);
  }
};

/**
 * Скидання пароля
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.body as { email: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) },
    });

    const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail(
      user.email,
      'Password Reset Request',
      `Click to reset your password: ${link}`,
      `Click to reset your password: ${link}`
    );

    return res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    next(err);
  }
};

/**
 * Підтвердження скидання пароля
 */
export const resetPasswordConfirm = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body as { newPassword: string };

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.resetToken !== token || (user.resetTokenExpiry ?? 0) < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return res.json({ message: 'Password reset successful' });
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid token' });
    }
    next(err);
  }
};

/**
 * Поточний користувач
 */
export const getCurrentUser = async (
  req: Request & { user?: { id: number } },
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        title: true,
        bio: true,
        images: true,
        country: true,
        city: true,
        street: true,
        house_number: true,
        postcode: true,
        lat: true,
        lon: true,
        createdAt: true,
        updatedAt: true,
        museum_logo_image: { select: { imageUrl: true } },
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (err) {
    next(err);
  }
};
