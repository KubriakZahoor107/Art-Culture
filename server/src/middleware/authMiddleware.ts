import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import prisma from "../prismaClient.js"

// JWT-аутентифікація
export default async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" })
    return
  }

  const token = authHeader.split(" ")[1]
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error("JWT_SECRET not set")
    res.status(500).json({ error: "Server configuration error" })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as { userId: number }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    })
    if (!user) {
      res.status(401).json({ error: "User not found" })
      return
    }

    // Додаємо user у глобально розширений Request
    req.user = { id: user.id, email: user.email, role: user.role }
    next()
  } catch (err) {
    console.error("Authentication error:", err)
    res.status(401).json({ error: "Unauthorized" })
  }
}
