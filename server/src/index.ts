import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';

// Визначаємо __dirname у ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Завантажуємо .env та перезаписуємо змінні оточення
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

// DEBUG: виводимо, що реально прочиталось із .env
const rawDbUrl = process.env.DATABASE_URL ?? '';
const cleanDbUrl = rawDbUrl.trim().replace(/^"+|"+$/g, '');
console.log('🔗 Using DATABASE_URL:', cleanDbUrl);

import app from './app.js';
import logger from './utils/logging.js';
import { PrismaClient } from '@prisma/client';

// Ініціалізація Prisma з очищеним URL
const prisma = new PrismaClient({
        datasources: { db: { url: cleanDbUrl } }
});

const PORT = Number(process.env.PORT) || 5000;

async function main(): Promise<void> {
        try {
                await prisma.$connect();
                logger.info('✅ Successfully connected to the database');
                app.listen(PORT, () => {
                        console.log(`🚀 Server listening on http://localhost:${PORT}`);
                });
        } catch (err) {
                console.error('🔥 FAILED TO START APP:', err);
                process.exit(1);
        }
}

// Глобальні обробники помилок ще до старту

// Глобальні обробники помилок

process.on('unhandledRejection', (reason) => {
        console.error('❌ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
        console.error('❌ Uncaught Exception:', err);
        process.exit(1);
});

main().catch((err) => {
        console.error('🔥 FAILED TO START APP:', err);
        process.exit(1);
});





