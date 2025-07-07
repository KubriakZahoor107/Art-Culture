// Example: Logging middleware for post actions
import { Request, Response, NextFunction } from 'express'

export const logPostActions = (
  req: Request & { user?: { id: number } },
  res: Response,
  next: NextFunction
) => {
	console.log(
		`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} by User ID: ${req.user.id}`
	)
	next()
}

// Export other middlewares as needed
