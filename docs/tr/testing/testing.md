# Testing Guide

This document provides comprehensive information about testing in the BilanApp project.

## Overview

The project uses Jest as the testing framework. Tests are organized into three main categories:
- Unit Tests
- Integration Tests
- End-to-End (E2E) Tests

## Test Structure

```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── __mocks__/        # Mock files
```

## Unit Tests

Unit tests focus on testing individual components in isolation.

### Test Files
- `tests/unit/models/` - Model tests
- `tests/unit/controllers/` - Controller tests
- `tests/unit/services/` - Service tests
- `tests/unit/utils/` - Utility function tests

### Example: User Model Test
```javascript
const { User } = require('@models');

describe('User Model', () => {
  test('should create a new user', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('user');
  });
});
```

### Mocking
```javascript
jest.mock('@models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));
```

## Integration Tests

Integration tests verify the interaction between different components.

### Test Files
- `tests/integration/api/` - API endpoint tests
- `tests/integration/auth/` - Authentication flow tests
- `tests/integration/database/` - Database operation tests

### Example: Authentication API Test
```javascript
const request = require('supertest');
const app = require('@app');

describe('Authentication API', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Test Database
```javascript
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
```

## End-to-End Tests

E2E tests verify complete user workflows.

### Test Files
- `tests/e2e/user-flow/` - User workflow tests
- `tests/e2e/admin-flow/` - Admin workflow tests
- `tests/e2e/beneficiary-flow/` - Beneficiary workflow tests

### Example: User Registration Flow
```javascript
describe('User Registration Flow', () => {
  test('should complete registration process', async () => {
    // 1. Visit registration page
    await page.goto('/register');
    
    // 2. Fill registration form
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('#submit');
    
    // 3. Verify success
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'services/**/*.js'
  ]
};
```

### Test Environment Variables
```env
NODE_ENV=test
DB_DIALECT=sqlite
DB_STORAGE=:memory:
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test tests/unit/models/user.test.js
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

## Test Coverage Requirements

- Overall coverage: 80%
- Critical paths: 90%
- Authentication: 95%
- Database operations: 85%

## Best Practices

1. Write tests before implementing features (TDD)
2. Keep tests independent and isolated
3. Use meaningful test descriptions
4. Mock external dependencies
5. Clean up test data after each test
6. Use appropriate assertions
7. Test both success and failure cases
8. Maintain test coverage requirements
9. Keep tests simple and focused
10. Use consistent naming conventions

## Common Issues and Solutions

### Database Connection Issues
```javascript
// Solution: Use test database
beforeAll(async () => {
  await sequelize.sync({ force: true });
});
```

### Authentication Issues
```javascript
// Solution: Mock authentication middleware
jest.mock('@middlewares/auth', () => ({
  authenticate: (req, res, next) => next()
}));
```

### File Upload Issues
```javascript
// Solution: Mock file upload
jest.mock('multer', () => ({
  diskStorage: () => ({
    _handleFile: (req, file, cb) => cb(null, { path: 'test-path' })
  })
}));
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Sequelize Testing Guide](https://sequelize.org/docs/v6/other-topics/testing/) 