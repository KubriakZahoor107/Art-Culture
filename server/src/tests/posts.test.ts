// @ts-nocheck
import request from 'supertest'
import { jest } from '@jest/globals'
import app from '../app.js'
import prisma from '../prismaClient.js'

// Мок Prisma-клієнта до імпорту app
jest.mock('../prismaClient.js', () => ({
  post: {
    findMany: jest.fn().mockResolvedValue([]),
  },
}));

import request from 'supertest';
import app from '../app.js';

describe('GET /api/posts', () => {
  it('responds with json array', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]); // перевіряємо, що тіло відповіді — пустий масив
  });
});
