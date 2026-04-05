const mongoose = require('mongoose');
require('dotenv').config();

// Connect to test database before all tests run
beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
});

// Clean up all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and drop test database after all tests finish
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});