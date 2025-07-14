import { Request, Response, NextFunction } from "express"

/**
 * Middleware: дозволяє доступ лише ролям із переліку
 */
export default function authorize(...allowedRoles: string[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: no user in request" })
			return
		}
		if (!allowedRoles.includes(req.user.role)) {
			res.status(403).json({ error: "Forbidden: insufficient rights" })
			return
		}
		next()
	}
}


