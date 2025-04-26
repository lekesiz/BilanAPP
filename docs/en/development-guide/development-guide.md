# BilanApp Development Guide

This guide provides comprehensive information for developers working on the BilanApp project.

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [API Documentation](#api-documentation)
5. [Database Management](#database-management)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)

## Development Environment Setup

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- SQLite3
- Git

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/bilan-app.git
   cd bilan-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
bilan-app/
├── bin/                # Application entry point
├── config/            # Configuration files
├── controllers/       # Route controllers
├── models/           # Database models
├── public/           # Static files
├── routes/           # Route definitions
├── services/         # Business logic
├── views/            # View templates
├── tests/            # Test files
└── docs/             # Documentation
```

## Coding Standards

### JavaScript/Node.js
- Use ES6+ features
- Follow async/await pattern
- Use proper error handling
- Implement proper logging
- Follow RESTful API principles

### Database
- Use migrations for schema changes
- Implement proper indexing
- Follow naming conventions
- Use transactions where necessary

## API Documentation

For detailed API documentation, refer to:
- [API Overview](api/api.md)
- [Authentication](api/authentication.md)
- [Endpoints](api/endpoints.md)

## Database Management

### Migrations
```bash
# Create a new migration
npm run db:migration:create --name=create_users_table

# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:migrate:undo
```

### Seeds
```bash
# Create a new seed
npm run db:seed:create --name=seed_users

# Run seeds
npm run db:seed

# Run specific seed
npm run db:seed --seed=seed_users
```

## Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/controllers/user.test.js
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage
```

## Deployment

### Production Setup
1. Set up environment variables
2. Build the application
3. Run database migrations
4. Start the server

### Deployment Commands
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues
1. Database connection issues
2. Authentication problems
3. API endpoint errors
4. Performance issues

### Debugging
- Use proper logging
- Check error messages
- Monitor system resources
- Review application logs

## Contributing

### Pull Request Process
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Code Review
- Follow coding standards
- Include tests
- Update documentation
- Provide clear commit messages

## Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [Jest Documentation](https://jestjs.io/) 