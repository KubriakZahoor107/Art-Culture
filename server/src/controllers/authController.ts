// File: /Users/konstantinkubriak/Desktop/Art-Culture/server/src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express'
import prisma from '../prismaClient.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

/**
 * Реєстрація нового користувача
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Приклад логіки:
    // const { email, password, role } = req.body
    // const hash = await bcrypt.hash(password, 10)
    // const user = await prisma.user.create({ data: { email, password: hash, role } })
    // res.status(201).json({ user })
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Логін користувача
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Ваша логіка логіну
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Запит на скидання пароля
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Ваша логіка відновлення пароля
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Підтвердження скидання пароля
 */
export async function resetPasswordConfirm(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Ваша логіка підтвердження
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Оновлення профілю поточного користувача
 */
export async function updateUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Ваша логіка оновлення (req.user уже заповнений middleware)
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Повертає дані поточного користувача з req.user
 */
export function getCurrentUser(
  req: Request,
  res: Response
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.json({ user: req.user })
}

/**
 * Синонім до getCurrentUser, якщо десь імпортують як getProfile
 */
export const getProfile = getCurrentUser
