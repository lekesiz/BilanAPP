# Testing Guide

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Test Types](#test-types)
3. [Testing Tools](#testing-tools)
4. [Test Environment](#test-environment)
5. [Writing Tests](#writing-tests)
6. [Running Tests](#running-tests)
7. [Continuous Integration](#continuous-integration)
8. [Best Practices](#best-practices)

## Testing Strategy

### Test Pyramid
```
        E2E Tests
           ▲
           │
    Integration Tests
           ▲
           │
     Unit Tests
```

### Coverage Goals
- Unit Tests: 80% coverage
- Integration Tests: 70% coverage
- E2E Tests: 50% coverage

### Test Priorities
1. Critical Path Tests
2. Security Tests
3. Performance Tests
4. Feature Tests
5. Edge Cases

## Test Types

### Unit Tests
- Test individual components
- Mock external dependencies
- Fast execution
- High coverage

Example:
```javascript
// tests/unit/services/UserService.test.js
const UserService = require('@services/UserService');
const User = require('@models/User');

jest.mock('@models/User');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      User.create.mockResolvedValue({
        id: 1,
        ...userData
      });

      const user = await UserService.createUser(userData);
      expect(user).toHaveProperty('id');
      expect(User.create).toHaveBeenCalledWith(userData);
    });
  });
});
```

### Integration Tests
- Test component interactions
- Use test database
- Test API endpoints
- Verify data flow

Example:
```javascript
// tests/integration/api/users.test.js
const request = require('supertest');
const app = require('@app');
const User = require('@models/User');

describe('User API', () => {
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
    });
  });
});
```

### End-to-End Tests
- Test complete user flows
- Use real browser
- Test UI interactions
- Verify system behavior

Example:
```javascript
// tests/e2e/user-flow.test.js
const { chromium } = require('playwright');

describe('User Flow', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should complete user registration', async () => {
    await page.goto('http://localhost:3000/register');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.success-message');
    expect(await page.textContent('.success-message')).toContain('Registration successful');
  });
});
```

### Performance Tests
- Load testing
- Stress testing
- Response time testing
- Resource usage testing

Example:
```javascript
// tests/performance/api.test.js
const loadtest = require('loadtest');

describe('API Performance', () => {
  it('should handle 100 requests per second', async () => {
    const options = {
      url: 'http://localhost:3000/api/v1/users',
      maxRequests: 1000,
      concurrency: 100,
      method: 'GET'
    };

    const result = await new Promise((resolve, reject) => {
      loadtest.loadTest(options, (error, result) => {
        if (error) reject(error);
        resolve(result);
      });
    });

    expect(result.meanLatencyMs).toBeLessThan(100);
    expect(result.errorRate).toBe(0);
  });
});
```

## Testing Tools

### Testing Frameworks
- Jest: Unit and integration testing
- Mocha: Alternative test runner
- Playwright: E2E testing
- Supertest: API testing

### Code Coverage
- Istanbul (nyc)
- Jest coverage
- Codecov integration

### Mocking
- Jest mocks
- Sinon
- Nock (HTTP mocking)

### Static Analysis
- ESLint
- Prettier
- TypeScript

## Test Environment

### Setup
```bash
# Install dependencies
npm install --save-dev jest @testing-library/react playwright

# Configure Jest
npx jest --init

# Configure Playwright
npx playwright install
```

### Environment Variables
```env
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@localhost:5432/test_db
REDIS_URL=redis://localhost:6379/1
```

### Database Setup
```javascript
// tests/setup.js
const { sequelize } = require('@models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
```

## Writing Tests

### Test Structure
```javascript
describe('Component', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Method', () => {
    it('should do something', () => {
      // Test
    });

    it('should handle error', () => {
      // Error test
    });
  });
});
```

### Assertions
```javascript
// Basic assertions
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Async assertions
await expect(promise).resolves.toBe(expected);
await expect(promise).rejects.toThrow();

// Object assertions
expect(object).toHaveProperty('key');
expect(array).toContain(value);
```

### Mocking
```javascript
// Mock functions
const mockFn = jest.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('value');
mockFn.mockRejectedValue(new Error('error'));

// Mock modules
jest.mock('@services/EmailService', () => ({
  sendEmail: jest.fn()
}));

// Mock HTTP requests
nock('http://api.example.com')
  .get('/users')
  .reply(200, { users: [] });
```

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run specific test
npm test -- path/to/test.js

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

### CI Configuration
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

## Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

### Coverage Reporting
```yaml
# .github/workflows/coverage.yml
name: Coverage
on: [push]
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## Best Practices

### Test Organization
- Group related tests
- Use descriptive names
- Follow consistent structure
- Keep tests independent

### Test Data
- Use factories for test data
- Clean up after tests
- Use realistic data
- Avoid hardcoding values

### Performance
- Mock external services
- Use test database
- Clean up resources
- Run tests in parallel

### Maintenance
- Update tests with code changes
- Remove obsolete tests
- Document test requirements
- Review test coverage

### Security
- Test authentication
- Test authorization
- Test input validation
- Test error handling 