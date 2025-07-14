// @ts-nocheck
import request from 'supertest';
import app from '../app'; // Явно .js → Jest підхоплює app.ts
// Mock для prismaClient
jest.mock('../prismaClient', () => ({
    post: {
        findMany: jest.fn().mockResolvedValue([]),
    },
}));
describe('GET /api/posts', () => {
    it('responds with json', async () => {
        const res = await request(app).get('/api/posts');
        expect(res.statusCode).toBe(200);
    });
});
