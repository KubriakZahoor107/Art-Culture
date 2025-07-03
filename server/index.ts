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
 * Головна функція для запуску сервера та підключення до бази даних.
 */
async function startServer() {
        try {
                // Підключаємося до бази даних
                await prisma.$connect();
                logger.info('✅ Successfully connected to the database.');

                // Запускаємо сервер і зберігаємо його екземпляр для коректного закриття
                const server = app.listen(PORT, () => {
                        logger.info(
                                `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
                        );
                });

                // Функція для graceful shutdown (коректного завершення роботи)
                const shutdown = async (signal) => {
                        logger.info(`${signal} received. Shutting down gracefully...`);
                        server.close(async () => {
                                logger.info('✅ HTTP server closed.');
                                await prisma.$disconnect();
                                logger.info('✅ Database connection closed.');
                                process.exit(0);
                        });
                };

                // Слухаємо системні сигнали для коректного завершення
                process.on('SIGINT', () => shutdown('SIGINT'));
                process.on('SIGTERM', () => shutdown('SIGTERM'));

        } catch (error) {
                logger.error('❌ Error starting the server:', error);
                await prisma.$disconnect();
                process.exit(1);
        }
}

// Обробка неперехоплених помилок (глобально)
process.on('uncaughtException', async (error) => {
        logger.error('Uncaught Exception:', error);
        await prisma.$disconnect();
        process.exit(1); // Обов'язково завершуємо процес, бо стан програми невідомий
});

process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Залежно від логіки, ви можете вирішити, чи завершувати процес
});


// Запускаємо наш сервер
startServer();