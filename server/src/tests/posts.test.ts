/**
 * @jest-environment node
 */
/* global jest */

import request from 'supertest'
import app from '../app.js'
import prisma from '../prismaClient.js'

jest.mock('../prismaClient.js', () => ({
  post: {
    findMany: jest.fn().mockResolvedValue([] as any[]),
  },
}))

describe('GET /api/posts', () => {
  it('повертає 200 і порожній масив', async () => {
    const res = await request(app).get('/api/posts')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual([])
  })
})


