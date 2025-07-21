// Example: Logging middleware for post actions
import { Request, Response, NextFunction } from 'express'

export const logPostActions = (
	req: Request, // Змінено: прибрано явне { user?: { id: number } }
	res: Response,
	next: NextFunction
) => {
	// Додаємо перевірку на req.user, оскільки TypeScript може вважати його необов'язковим
	// або якщо middleware автентифікації не спрацював.
	if (req.user && req.user.id) {
		console.log(
			`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} by User ID: ${req.user.id}`
		)
	} else {
		console.log(
			`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} by Unknown User`
		)
	}
	next()
}

// Export other middlewares as needed
