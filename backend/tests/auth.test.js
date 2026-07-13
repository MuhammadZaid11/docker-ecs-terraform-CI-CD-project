import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../src/models/User.js';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Connect to a test database or mock (for simplicity in this project using local test db)
    const url = `mongodb://localhost:27017/taskflow-test-${new Date().getTime()}`;
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toEqual('test@example.com');
  });

  it('should login an existing user', async () => {
    await User.create({
      name: 'Login User',
      email: 'login@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject invalid login credentials', async () => {
    await User.create({
      name: 'Invalid User',
      email: 'invalid@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
  });
});
