const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
require('dotenv').config();

// Connect to test DB before tests
beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
});

// Clear DB after each test
afterEach(async () => {
  await User.deleteMany({});
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// -----------------------------------------------
// SIGNUP TESTS
// -----------------------------------------------
describe('Signup', () => {

  it('should load the signup page', async () => {
    const res = await request(app).get('/signup');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Create Account');
  });

  it('should sign up a new user and redirect to todos', async () => {
    const res = await request(app)
      .post('/signup')
      .send('username=testuser&password=password123');

    // 302 means redirect — which happens after successful signup
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/todos');
  });

  it('should not sign up with a duplicate username', async () => {
    // Create a user first
    await User.create({ username: 'testuser', password: 'password123' });

    // Try signing up with the same username
    const res = await request(app)
      .post('/signup')
      .send('username=testuser&password=password123');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Username already taken');
  });

  it('should not sign up with missing username', async () => {
    const res = await request(app)
      .post('/signup')
      .send('username=&password=password123');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('required');
  });

  it('should not sign up with missing password', async () => {
    const res = await request(app)
      .post('/signup')
      .send('username=testuser&password=');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('required');
  });

});

// -----------------------------------------------
// LOGIN TESTS
// -----------------------------------------------
describe('Login', () => {

  it('should load the login page', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Login');
  });

  it('should log in with correct credentials', async () => {
    // First create a user
    await request(app)
      .post('/signup')
      .send('username=testuser&password=password123');

    // Then try to log in
    const res = await request(app)
      .post('/login')
      .send('username=testuser&password=password123');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/todos');
  });

  it('should not log in with wrong password', async () => {
    await request(app)
      .post('/signup')
      .send('username=testuser&password=password123');

    const res = await request(app)
      .post('/login')
      .send('username=testuser&password=wrongpassword');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Invalid username or password');
  });

  it('should not log in with non-existent username', async () => {
    const res = await request(app)
      .post('/login')
      .send('username=nobody&password=password123');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Invalid username or password');
  });

});

// -----------------------------------------------
// LOGOUT TESTS
// -----------------------------------------------
describe('Logout', () => {

  it('should redirect to login after logout', async () => {
    const res = await request(app).get('/logout');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

});