/**
 * @jest-environment node
 */
/* global jest */
import request from 'supertest';
import app from '../app.js';
import prisma from '../prismaClient.js'; // Імпорт для типізації
// Мокуємо Prisma Client.
// Важливо: для ESM моків, якщо оригінальний модуль використовує `export default`,
// мок повинен експортувати `default` властивість.
jest.mock('../prismaClient.js', () => {
    return {
        __esModule: true, // Обов'язково для ESM моків
        default: {
            post: {
                // Явно приводимо findMany до Jest Mock
                findMany: jest.fn(),
            },
            // Додаємо $disconnect, оскільки Prisma Client має цю функцію для очищення
            $disconnect: jest.fn(),
            // Додайте інші моделі, якщо вони використовуються в інших тестах і потребують мокування
            // наприклад:
            // user: {
            //   findMany: jest.fn(),
            // },
        },
    };
});
// Для зручності типізації та доступу до мокованих функцій
const mockedPrisma = prisma;
describe('GET /api/posts', () => {
    // Виконуємо очищення перед кожним тестом, щоб забезпечити ізоляцію
    beforeEach(() => {
        jest.clearAllMocks(); // Очищає всі виклики моків та їхні повернення
        jest.resetModules(); // Скидає реєстр модулів - може допомогти з проблемами імпорту/кешування
        // Переконайтеся, що mockResolvedValue встановлено для кожного тесту,
        // якщо ви хочете, щоб він повертав різні значення.
        mockedPrisma.post.findMany.mockResolvedValue([]); // Явно приводимо до Jest.Mock
    });
    // Очищення після всіх тестів у цьому наборі
    afterAll(async () => {
        // Якщо Prisma Client був мокований, викликаємо його мокований $disconnect
        await mockedPrisma.$disconnect();
        // Якщо ваш Express-додаток (app.js) запускає HTTP-сервер,
        // і цей сервер потрібно явно закрити, це місце для цього.
        // Однак, supertest зазвичай керує життєвим циклом сервера для тестів.
    });
    it('повертає 200 і порожній масив, якщо постів немає', async () => {
        // Мок вже встановлено в beforeEach, але можна перевизначити, якщо потрібно
        // (mockedPrisma.post.findMany as jest.Mock).mockResolvedValue([]);
        const res = await request(app).get('/api/posts');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
        expect(mockedPrisma.post.findMany).toHaveBeenCalledTimes(1);
    });
    it('повертає 200 і масив постів, якщо вони існують', async () => {
        const mockPosts = [
            { id: 1, title_en: 'Test Post 1', content_en: 'Content 1', title_uk: 'Тестовий Пост 1', content_uk: 'Контент 1', images: [] },
            { id: 2, title_en: 'Test Post 2', content_en: 'Content 2', title_uk: 'Тестовий Пост 2', content_uk: 'Контент 2', images: [] },
        ];
        mockedPrisma.post.findMany.mockResolvedValue(mockPosts); // Явно приводимо до Jest.Mock
        const res = await request(app).get('/api/posts');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockPosts);
        expect(mockedPrisma.post.findMany).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=posts.test.js.map