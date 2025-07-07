// @ts-nocheck
import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../app';

// Мок Prisma-клієнта до імпорту app
jest.mock('../prismaClient', () => ({
  post: {
    findMany: jest.fn().mockResolvedValue([]),
  },
}));

describe('GET /api/posts', () => {
  it('responds with json array', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]); // перевіряємо, що тіло відповіді — пустий масив
  });
});
