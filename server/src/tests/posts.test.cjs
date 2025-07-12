const request = require('supertest');
const app = require('../app.js');

describe('POST /posts', () => {
  it('should create a new post', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Test', content: 'Hello' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
