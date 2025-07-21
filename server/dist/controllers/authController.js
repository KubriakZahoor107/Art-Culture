// File: /Users/konstantinkubriak/Desktop/Art-Culture/server/src/controllers/authController.ts
import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
/**
 * Helper function to remove sensitive fields from the user object.
 * @param user - User object obtained from Prisma.
 * @returns User object without sensitive fields.
 */
function sanitizeUser(user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user; // Added resetToken and resetTokenExpiry
    return safeUser;
}
/**
 * Register a new user
 */
export async function register(req, res, next) {
    try {
        const { email, password, role } = req.body;
        // Check if a user with this email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: 'Користувач з таким email вже існує' });
            return; // Add return to complete function execution
        }
        const hash = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({ data: { email, password: hash, role } });
        // Return a safe user object without password
        res.status(201).json({ user: sanitizeUser(newUser), message: 'Користувача успішно зареєстровано' });
    }
    catch (err) {
        console.error('Error during registration:', err);
        next(err); // Pass the error to the next middleware
    }
}
/**
 * User login
 */
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Невірний email або пароль' });
            return; // Add return to complete function execution
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Невірний email або пароль' });
            return; // Add return to complete function execution
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        // Create JWT token with id, email, and role.
        // Important: DO NOT include sensitive data like password hash here.
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Return token and safe user object
        res.status(200).json({ token, user: sanitizeUser(user) });
    }
    catch (err) {
        console.error('Error during login:', err);
        next(err); // Pass the error to the next middleware
    }
}
/**
 * Update current user's profile
 */
export async function updateUserProfile(req, res, next) {
    try {
        // req.user is now reliably typed thanks to src/types/express/index.d.ts
        // and contains id, email, role from the token.
        if (!req.user || !req.user.id) {
            res.status(401).json({ error: "Unauthorized access" });
            return;
        }
        const userId = req.user.id;
        const { email, password, ...otherData } = req.body;
        const updateData = { ...otherData };
        if (email) {
            updateData.email = email;
        }
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            // Select only safe fields to return, or use sanitizeUser
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
                password: true,
                resetToken: true,
                resetTokenExpiry: true, // Додана кома тут
                state: true // ТЕПЕР БЕЗ ПОМИЛОК
            }
        });
        res.status(200).json({ user: sanitizeUser(updatedUser), message: 'Профіль успішно оновлено' });
    }
    catch (err) {
        console.error('Error updating profile:', err);
        next(err); // Pass the error to the next middleware
    }
}
/**
 * Returns data of the current authenticated user
 */
export async function getCurrentUser(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ error: 'Неавторизований' });
            return;
        }
        // Get full user data from DB using ID from token
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            // Select all fields needed for sanitizeUser
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
                password: true,
                resetToken: true,
                resetTokenExpiry: true, // Додана кома тут
                state: true // ТЕПЕР БЕЗ ПОМИЛОК
            }
        });
        if (!currentUser) {
            res.status(404).json({ error: 'Користувача не знайдено' });
            return;
        }
        // Return safe data
        res.status(200).json({ user: sanitizeUser(currentUser) });
    }
    catch (err) {
        console.error('Error getting current user:', err);
        next(err); // Pass the error to the next middleware
    }
}
/**
 * Password reset request
 */
export async function resetPassword(req, res, next) {
    try {
        // Ваша логіка відновлення пароля
        res.status(501).json({ message: "Password reset function not yet implemented" });
        return;
    }
    catch (err) {
        next(err);
    }
}
/**
 * Password reset confirmation
 */
export async function resetPasswordConfirm(req, res, next) {
    try {
        // Ваша логіка підтвердження
        res.status(501).json({ message: "Password reset confirmation function not yet implemented" });
        return;
    }
    catch (err) {
        next(err);
    }
}
// Synonym for getCurrentUser, if imported as getProfile
export const getProfile = getCurrentUser;
//# sourceMappingURL=authController.js.map