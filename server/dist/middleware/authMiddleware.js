import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js"; // Важливо: імпортуємо Prisma для отримання даних користувача
/**
 * Middleware для автентифікації користувача за JWT токеном.
 * Верифікує токен, отримує повні дані користувача з БД і додає їх до req.user.
 */
export async function authenticateToken(// Додано 'async'
req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("JWT_SECRET not set");
        res.status(500).json({ error: "Server configuration error" });
        return;
    }
    try {
        // Верифікуємо токен. Payload токена містить id, email та role, які ми закодували.
        // Ми не типізуємо його як JwtPayload, оскільки JwtPayload більше не експортується.
        const payload = jwt.verify(token, secret);
        // Отримуємо повні дані користувача з бази даних за ID з токена.
        // Це важливо, щоб req.user мав усі поля, які очікуються (наприклад, resetToken).
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            // Вибираємо всі поля, які потрібні для sanitizeUser та подальшої роботи
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
                houseNumber: true,
                postcode: true,
                lat: true,
                lon: true,
                createdAt: true,
                updatedAt: true,
                password: true, // Включаємо пароль, щоб sanitizeUser міг його видалити
                resetToken: true, // Обов'язково включаємо
                resetTokenExpiry: true, // Обов'язково включаємо
                state: true // ДОДАНО: Включаємо поле 'state'
            },
        });
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        // Присвоюємо повний об'єкт користувача до req.user.
        // Завдяки src/types/express.d.ts, TypeScript тепер знає, що req.user - це тип User з Prisma.
        req.user = user;
        next();
    }
    catch (err) {
        console.error("Authentication error:", err);
        res.status(403).json({ error: "Unauthorized: Invalid or expired token" }); // 403 Forbidden для недійсного токена
        return;
    }
}
//# sourceMappingURL=authMiddleware.js.map