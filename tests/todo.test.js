const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Todo = require('../models/Todo');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
});

afterEach(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Helper function to sign up and return an authenticated agent
// An "agent" is like a browser — it remembers cookies between requests
const getAuthenticatedAgent = async () => {
  const agent = request.agent(app);
  await agent
    .post('/signup')
    .send('username=testuser&password=password123');
  return agent;
};

// -----------------------------------------------
// TODO PAGE TESTS
// -----------------------------------------------
describe('Todo Page', () => {

  it('should redirect unauthenticated users to login', async () => {
    const res = await request(app).get('/todos');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('should load the todos page for logged in users', async () => {
    const agent = await getAuthenticatedAgent();
    const res = await agent.get('/todos');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('My Todos');
  });

});

// -----------------------------------------------
// CREATE TODO TESTS
// -----------------------------------------------
describe('Create Todo', () => {

  it('should create a new todo and redirect', async () => {
    const agent = await getAuthenticatedAgent();
    const res = await agent
      .post('/todos')
      .send('title=Buy groceries');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/todos');
  });

  it('should show the new todo on the page after creating', async () => {
    const agent = await getAuthenticatedAgent();

    await agent.post('/todos').send('title=Buy groceries');

    const res = await agent.get('/todos');
    expect(res.text).toContain('Buy groceries');
  });

});

// -----------------------------------------------
// UPDATE TODO STATUS TESTS
// -----------------------------------------------
describe('Update Todo Status', () => {

  it('should mark a todo as completed', async () => {
    const agent = await getAuthenticatedAgent();

    // Create a todo first
    await agent.post('/todos').send('title=Test task');

    // Get the todo from DB to get its id
    const todo = await Todo.findOne({ title: 'Test task' });

    // Mark it as completed
    const res = await agent
      .post(`/todos/${todo._id}`)
      .send('status=completed');

    expect(res.statusCode).toBe(302);

    // Confirm in the database it's actually completed
    const updated = await Todo.findById(todo._id);
    expect(updated.status).toBe('completed');
  });

  it('should mark a todo as deleted', async () => {
    const agent = await getAuthenticatedAgent();

    await agent.post('/todos').send('title=Task to delete');

    const todo = await Todo.findOne({ title: 'Task to delete' });

    const res = await agent
      .post(`/todos/${todo._id}`)
      .send('status=deleted');

    expect(res.statusCode).toBe(302);

    const updated = await Todo.findById(todo._id);
    expect(updated.status).toBe('deleted');
  });

  it('should not update a todo belonging to another user', async () => {
    // Create first user and their todo
    const agent1 = await getAuthenticatedAgent();
    await agent1.post('/todos').send('title=Private task');
    const todo = await Todo.findOne({ title: 'Private task' });

    // Create second user
    const agent2 = request.agent(app);
    await agent2.post('/signup').send('username=otheruser&password=password123');

    // Second user tries to update first user's todo
    await agent2.post(`/todos/${todo._id}`).send('status=completed');

    // Todo should still be pending
    const unchanged = await Todo.findById(todo._id);
    expect(unchanged.status).toBe('pending');
  });

});

// -----------------------------------------------
// FILTER TESTS
// -----------------------------------------------
describe('Filter Todos', () => {

  it('should filter and show only pending todos', async () => {
    const agent = await getAuthenticatedAgent();

    await agent.post('/todos').send('title=Pending task');
    await agent.post('/todos').send('title=Completed task');

    const todo = await Todo.findOne({ title: 'Completed task' });
    await agent.post(`/todos/${todo._id}`).send('status=completed');

    const res = await agent.get('/todos?filter=pending');
    expect(res.text).toContain('Pending task');
    expect(res.text).not.toContain('Completed task');
  });

  it('should filter and show only completed todos', async () => {
    const agent = await getAuthenticatedAgent();

    await agent.post('/todos').send('title=Pending task');
    await agent.post('/todos').send('title=Completed task');

    const todo = await Todo.findOne({ title: 'Completed task' });
    await agent.post(`/todos/${todo._id}`).send('status=completed');

    const res = await agent.get('/todos?filter=completed');
    expect(res.text).toContain('Completed task');
    expect(res.text).not.toContain('Pending task');
  });

});