// server/src/utils/generateToken.ts
import jwt from 'jsonwebtoken';
// Гарантируем, что JWT_SECRET точно строка
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET must be defined');
}
/**
 * Генерує JWT для переданого користувача.
 */
export default function generateToken(user) {
    if (!user.id) {
        throw new Error('User ID is missing during token generation');
    }
    return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '5h' });
}
