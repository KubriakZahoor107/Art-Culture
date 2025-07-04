// ✅ Імпортуємо екземпляр Express, щоб мати до нього доступ
import app from './src/app.js';
import prisma from './src/prismaClient';
import logger from './src/utils/logging.js';
import dotenv from 'dotenv';

// Завантажуємо змінні середовища з файлу .env
dotenv.config();

// Визначаємо порт, використовуючи 5000 як запасний варіант
const PORT = process.env.PORT || 5000;

/**
 * Головна функція для запуску сервера та (заглушеного) підключення до бази даних.
 */
async function startServer() {
        try {
                // ==== DB connection stub for Stage 0 ====
                // await prisma.$connect();
                logger.info('ℹ️  Skipping database connection (stubbed for Stage 0)');
                // =========================================

                // Запускаємо сервер і зберігаємо його екземпляр для коректного закриття
                const server = app.listen(PORT, () => {
                        logger.info(
                                `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
                        );
                });

                // Функція для graceful shutdown (коректного завершення роботи)
                const shutdown = async (signal: string) => {
                        logger.info(`${signal} received. Shutting down gracefully...`);
                        server.close(async () => {
                                logger.info('✅ HTTP server closed.');
                                // await prisma.$disconnect(); // залишаємо для Етапу 1
                                logger.info('✅ Database disconnect skipped (stubbed)');
                                process.exit(0);
                        });
                };

                // Слухаємо системні сигнали для коректного завершення
                process.on('SIGINT', () => shutdown('SIGINT'));
                process.on('SIGTERM', () => shutdown('SIGTERM'));
        } catch (error) {
                logger.error('❌ Error starting the server:', error);
                // await prisma.$disconnect();
                process.exit(1);
        }
}

// Обробка неперехоплених помилок (глобально)
process.on('uncaughtException', async (error: Error) => {
        logger.error('Uncaught Exception:', error);
        // await prisma.$disconnect();
        process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // залежно від логіки можна graceful shutdown
});

// Запускаємо наш сервер
startServer();
