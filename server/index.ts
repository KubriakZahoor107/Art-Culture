import 'dotenv/config';                               // завантажує .env
import app from './src/app.js';                       // цей шлях → src/app.ts
import prisma from './src/prismaClient.js';           // → src/prismaClient.ts
import logger from './src/utils/logging.js';          // → src/utils/logging.ts

const PORT = Number(process.env.PORT) || 5000;

async function main(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Successfully connected to the database');

    app.listen(PORT, () => {
      logger.info(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('🔥 FAILED TO START APP:', err);
    process.exit(1);
  }
}

main();

// глобальна обробка необроблених промісів/винятків
process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

