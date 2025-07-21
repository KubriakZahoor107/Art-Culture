import 'dotenv/config';
import app from './app.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.$connect();
    console.info('✅ Connected to the database');
    // Додаємо простий кореневий ендпоінт
    app.get('/', (_req, res) => {
        res.send('Art-Culture API is running');
    });
    // Запуск сервера
    const port = Number(process.env.PORT ?? 5000);
    app.listen(port, () => {
        console.log(`🚀 Server listening on http://localhost:${port}`);
    });
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('🛑 SIGINT received, shutting down...');
        await prisma.$disconnect();
        process.exit();
    });
}
main().catch((err) => {
    console.error('🔥 Failed to start app:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map