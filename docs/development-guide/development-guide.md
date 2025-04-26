# Development Guide

## Table of Contents
1. [Project Structure](#project-structure)
2. [Coding Standards](#coding-standards)
3. [Git Workflow](#git-workflow)
4. [Code Review Process](#code-review-process)
5. [Documentation Standards](#documentation-standards)
6. [Performance Guidelines](#performance-guidelines)
7. [Security Guidelines](#security-guidelines)
8. [Troubleshooting](#troubleshooting)

## Project Structure

```
bilan-app/
├── bin/                    # Application entry points
├── config/                 # Configuration files
├── controllers/           # Route controllers
├── middlewares/           # Custom middleware
├── models/                # Database models
├── public/                # Static files
├── routes/                # Route definitions
├── services/              # Business logic
├── utils/                 # Utility functions
├── views/                 # View templates
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── api/              # API tests
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
└── uploads/               # File uploads
```

### Key Directories

#### Controllers
- Handle HTTP requests
- Validate input
- Call appropriate services
- Return responses

Example:
```javascript
// controllers/UserController.js
const UserService = require('@services/UserService');

class UserController {
  async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }
  }
}
```

#### Services
- Implement business logic
- Handle data operations
- Manage transactions
- Call external services

Example:
```javascript
// services/UserService.js
const User = require('@models/User');
const EmailService = require('@services/EmailService');

class UserService {
  async createUser(userData) {
    const existingUser = await User.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user = await User.create(userData);
    await EmailService.sendWelcomeEmail(user.email);
    
    return user;
  }
}
```

#### Models
- Define database schema
- Handle data validation
- Define relationships
- Implement hooks

Example:
```javascript
// models/User.js
const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    super.init({
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'User'
    });
  }

  static associate(models) {
    this.hasMany(models.Beneficiary, {
      foreignKey: 'userId',
      as: 'beneficiaries'
    });
  }
}
```

## Coding Standards

### JavaScript/Node.js
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use async/await for asynchronous code
- Implement proper error handling
- Use meaningful variable names

Example:
```javascript
// Good
async function getUserById(id) {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
}

// Bad
function getUserById(id) {
  User.findByPk(id).then(user => {
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }).catch(err => {
    console.log(err);
    throw err;
  });
}
```

### Database
- Use migrations for schema changes
- Implement proper indexing
- Follow naming conventions
- Use transactions for multiple operations

Example:
```javascript
// Good
await sequelize.transaction(async (t) => {
  const user = await User.create(userData, { transaction: t });
  await Profile.create({ userId: user.id }, { transaction: t });
});

// Bad
const user = await User.create(userData);
await Profile.create({ userId: user.id });
```

### API Design
- Follow RESTful principles
- Use proper HTTP methods
- Implement versioning
- Document endpoints

Example:
```javascript
// Good
router.post('/api/v1/users', validateUserInput, UserController.createUser);
router.get('/api/v1/users/:id', authenticate, UserController.getUser);
router.put('/api/v1/users/:id', authenticate, validateUserInput, UserController.updateUser);

// Bad
router.post('/createUser', UserController.createUser);
router.get('/getUser/:id', UserController.getUser);
```

## Git Workflow

### Branch Naming
- feature/: Feature branches
- bugfix/: Bug fixes
- hotfix/: Urgent fixes
- release/: Release preparation

Example:
```bash
git checkout -b feature/user-authentication
git checkout -b bugfix/login-validation
git checkout -b hotfix/critical-security-issue
git checkout -b release/v1.0.0
```

### Commit Messages
- Use present tense
- Be descriptive
- Reference issues

Example:
```bash
git commit -m "Add user authentication feature"
git commit -m "Fix login validation for special characters"
git commit -m "Update dependencies to fix security vulnerabilities"
```

### Pull Requests
- Include description
- Reference issues
- Add screenshots if applicable
- Request reviews

Example:
```markdown
## Description
Adds user authentication feature with JWT tokens

## Changes
- Add User model and migration
- Implement authentication service
- Add login and register endpoints
- Add authentication middleware

## Related Issues
Closes #123

## Screenshots
![Login Page](screenshots/login.png)
```

## Code Review Process

### Review Checklist
- [ ] Code follows style guide
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] Performance is considered
- [ ] Security is addressed
- [ ] Error handling is proper
- [ ] Logging is implemented

### Review Comments
```javascript
// Good
// Consider using a constant for the magic number
const MAX_LOGIN_ATTEMPTS = 5;
if (attempts > MAX_LOGIN_ATTEMPTS) {

// Bad
if (attempts > 5) { // Magic number
```

## Documentation Standards

### Code Comments
```javascript
/**
 * Creates a new user with the provided data
 * @param {Object} userData - User information
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @returns {Promise<User>} Created user instance
 * @throws {Error} If email already exists
 */
async function createUser(userData) {
  // Implementation
}
```

### API Documentation
```javascript
/**
 * @api {post} /api/v1/users Create User
 * @apiName CreateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} email User's email address
 * @apiParam {String} password User's password
 *
 * @apiSuccess {Boolean} success Operation status
 * @apiSuccess {Object} data User data
 * @apiSuccess {String} data.id User ID
 * @apiSuccess {String} data.email User email
 */
```

## Performance Guidelines

### Database Optimization
- Use proper indexes
- Implement query optimization
- Use connection pooling
- Cache frequently accessed data

Example:
```javascript
// Good
const users = await User.findAll({
  where: { status: 'active' },
  include: [{
    model: Profile,
    attributes: ['title', 'bio']
  }],
  limit: 10,
  offset: 0
});

// Bad
const users = await User.findAll();
const activeUsers = users.filter(user => user.status === 'active');
```

### API Optimization
- Implement pagination
- Use compression
- Cache responses
- Optimize payload size

Example:
```javascript
// Good
router.get('/api/v1/users', cache(300), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const users = await UserService.getUsers(page, limit);
  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total: await User.count()
    }
  });
});

// Bad
router.get('/api/v1/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});
```

## Security Guidelines

### Authentication
- Use JWT tokens
- Implement refresh tokens
- Set proper token expiration
- Use secure password hashing

Example:
```javascript
// Good
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Bad
const token = jwt.sign(
  { userId: user.id },
  'hardcoded-secret',
  { expiresIn: '30d' }
);
```

### Data Protection
- Validate input
- Sanitize output
- Use parameterized queries
- Implement rate limiting

Example:
```javascript
// Good
const user = await User.findOne({
  where: { email: sanitizeInput(email) }
});

// Bad
const user = await User.findOne({
  where: sequelize.literal(`email = '${email}'`)
});
```

## Troubleshooting

### Common Issues
1. Database Connection
```bash
# Check database status
psql -U your_user -d your_db -c "SELECT 1"

# Check connection pool
SELECT * FROM pg_stat_activity;
```

2. Memory Usage
```bash
# Check Node.js memory usage
node --inspect your-app.js

# Monitor memory
pm2 monit
```

3. Performance Issues
```bash
# Check slow queries
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

# Monitor CPU usage
top
```

### Debugging Tools
- Node Inspector
- PM2 Monitoring
- Database Query Analyzer
- Redis Monitor

Example:
```javascript
// Enable debugging
DEBUG=app:* npm start

// Monitor Redis
redis-cli monitor
``` 