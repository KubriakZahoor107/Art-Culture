// server/src/controllers/authController.ts
import bcrypt from 'bcrypt'
import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'

import prisma from '../prismaClient'
import generateToken from '../utils/generateToken'
import logger from '../utils/logging'
import sendEmail from '../utils/sendEmails'
import { applyMuseumFields } from '../utils/applyMuseumFields'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Реєстрація нового користувача (або музею, якщо role === 'MUSEUM')
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Валідація
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
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
    } = req.body as Record<string, any>

    // 2) Перевірка, чи вже є такий email
    const cnt = await prisma.user.count({ where: { email } })
    if (cnt > 0) {
      res.status(400).json({ error: 'User already exists' })
      return
    }

    // 3) Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4) Формування даних для створення
    const userData: Record<string, any> = {
      email,
      password: hashedPassword,
      images: req.body.profileImagePath ?? null,
      role,
      title,
      bio,
    }

    // Якщо музей — додаємо додаткові поля
    if (role === 'MUSEUM') {
      applyMuseumFields(userData, {
        country,
        city,
        street,
        house_number,
        postcode,
        lat,
        lon,
      })
    }

    // 5) Створюємо користувача
    const user = await prisma.user.create({ data: userData })

    // 6) Якщо є логотип музею — додаємо його
    if (role === 'MUSEUM' && req.body.museumLogoPath) {
      await prisma.museumLogoImage.create({
        data: {
          userId: user.id,
          imageUrl: req.body.museumLogoPath,
        },
      })
    }

    // 7) Відправка листа
    await sendEmail(
      user.email,
      'Підтвердження реєстрації',
      `Дякуємо за реєстрацію на ArtPlayUkraine.`,
      `<p>Дякуємо за реєстрацію на ArtPlayUkraine. <a href="${process.env.CLIENT_URL}">Перейти до сайту</a></p>`
    )

    // 8) Генерація та відповідь з токеном
    const token = generateToken(user)
    const { password: _pwd, ...userWithoutPassword } = user
    res.status(201).json({ token, user: userWithoutPassword })
  } catch (err) {
    next(err)
  }
}

/**
 * Логін користувача
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { email, password } = req.body as { email: string; password: string }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const matches = await bcrypt.compare(password, user.password)
    if (!matches) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = generateToken(user)
    const { password: _pwd, ...userWithoutPassword } = user
    res.json({ token, user: userWithoutPassword })
  } catch (err) {
    logger.error('Login error:', err)
    next(err)
  }
}

/**
 * Запит на скидання пароля — генерує токен і шле на email
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body as { email: string }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    })

    const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    await sendEmail(
      user.email,
      'Password Reset Request',
      `Click to reset your password: ${link}`,
      `Click to reset your password: ${link}`
    )

    res.json({ message: 'Password reset link sent to email' })
  } catch (err) {
    next(err)
  }
}

/**
 * Підтвердження скидання — встановлює новий пароль
 */
export const resetPasswordConfirm = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params
    const { newPassword } = req.body as { newPassword: string }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }


    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashed },
    })

    res.json({ message: 'Password reset successful' })
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') {
      res.status(400).json({ error: 'Invalid token' })
      return
    }
    next(err)
  }
}

/**
 * Отримати дані поточного користувача
 */
export const getCurrentUser = async (
  req: Request & { user?: { id: number } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
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
        museumLogoImage: { select: { imageUrl: true } },
      },
    })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch (err) {
    next(err)
  }
}

/**
 * Оновлення профілю користувача (та логотипу музею, якщо є)
 */
export const updateUserProfile = async (
  req: Request & { user?: { id: number; role: string; images?: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      bio,
      country,
      city,
      street,
      house_number,
      postcode,
      lat,
      lon,
    } = req.body as Record<string, any>

    const existing = await prisma.user.findUnique({
      where: { id: req.user!.id },
    })
    if (!existing) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    let images = existing.images
    if (req.body.profileImagePath) {
      const oldPath = path.join(__dirname, '../../', existing.images ?? '')
      images = req.body.profileImagePath
      try {
        await fs.promises.unlink(oldPath)
        logger.info(`Old image deleted: ${oldPath}`)
      } catch (e: any) {
        if (e.code !== 'ENOENT') logger.error('Failed to delete old image:', e)
      }
    }

    const updateData: Record<string, any> = {
      title: title ?? existing.title,
      bio: bio ?? existing.bio,
      images,
    }

    if (existing.role === 'MUSEUM') {
      applyMuseumFields(updateData, {
        country,
        city,
        street,
        house_number,
        postcode,
        lat,
        lon,
      })
    }

    // Оновлення або створення логотипу музею
    if (req.body.museumLogoPath && existing.role === 'MUSEUM') {
      const logoRec = await prisma.museumLogoImage.findUnique({
        where: { userId: existing.id },
      })
      if (logoRec) {
        await prisma.museumLogoImage.update({
          where: { userId: existing.id },
          data: { imageUrl: req.body.museumLogoPath },
        })
        const oldLogo = path.join(__dirname, '../../', logoRec.imageUrl)
        try {
          await fs.promises.unlink(oldLogo)
          logger.info(`Old museum logo deleted: ${oldLogo}`)
        } catch (e: any) {
          if (e.code !== 'ENOENT') logger.error('Failed to delete old logo:', e)
        }
      } else {
        await prisma.museumLogoImage.create({
          data: { userId: existing.id, imageUrl: req.body.museumLogoPath },
        })
      }
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: updateData,
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
        museumLogoImage: { select: { imageUrl: true } },
      },
    })

    res.json({ user: updated, message: 'Profile updated successfully' })
  } catch (err) {
    logger.error('Error updating user profile:', err)
    next(err)
  }
}
