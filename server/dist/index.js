import 'dotenv/config';
import app from './app.js';
import prisma from './prismaClient.js';
import logger from './utils/logging.js';
const PORT = Number(process.env.PORT) || 5000;
async function main() {
    try {
        await prisma.$connect();
        logger.info('✅ Successfully connected to the database');
        app.listen(PORT, () => {
            console.log(`🚀 Server listening on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('🔥 FAILED TO START APP:', err);
        process.exit(1);
    }
}
main();
// Глобальні обробники помилок ще до старту
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});
// Запуск основної функції з ловлею помилок
main().catch((err) => {
    console.error('🔥 FAILED TO START APP:', err);
    process.exit(1);
});
