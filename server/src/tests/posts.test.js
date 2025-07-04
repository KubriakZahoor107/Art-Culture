import request from 'supertest'
import app from '../app.js'
import prisma from '../prismaClient.js'

jest.mock('../prismaClient.js', () => ({
  post: {
    findMany: jest.fn().mockResolvedValue([]),
  },
}))

describe('GET /api/posts', () => {
  it('responds with json', async () => {
    const res = await request(app).get('/api/posts')
    expect(res.statusCode).toBe(200)
  })
})
