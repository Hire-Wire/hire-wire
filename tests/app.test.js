import request from 'supertest';
import app from '../server.js';

describe('GET /', () => {
  it('should respond with Hello from our server!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Hello from our server');
  });
});