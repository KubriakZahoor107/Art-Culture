import { PrismaClient } from '@prisma/client';
const rawUrl = process.env.DATABASE_URL ?? '';
// Видаляємо будь-які початкові/кінцеві лапки
const cleanUrl = rawUrl.replace(/^"+|"+$/g, '');
const prisma = new PrismaClient({
    datasources: { db: { url: cleanUrl } }
});
export default prisma;
