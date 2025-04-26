# BilanApp

BilanApp is a comprehensive social service management platform designed to streamline beneficiary management, assessment processes, and service delivery for social service organizations.

## Features

- **Beneficiary Management**: Track and manage beneficiary information, history, and interactions
- **Assessment Tools**: Create and manage assessment questionnaires and track responses
- **Document Management**: Upload, store, and organize beneficiary documents
- **Appointment Scheduling**: Schedule and manage appointments with beneficiaries
- **Communication**: Send messages and notifications to beneficiaries
- **Reporting**: Generate reports and analytics on service delivery

## Getting Started

### Prerequisites

- Node.js v18.x or higher
- npm v9.x or higher
- SQLite3
- Git

### Installation

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

5. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Documentation

- [Development Guide](docs/en/development-guide/development-guide.md)
- [Deployment Guide](docs/en/deployment-guide/deployment-guide.md)
- [API Documentation](docs/en/api/endpoints.md)

## Project Structure

```
bilan-app/
├── bin/                # Application startup scripts
├── config/             # Configuration files
├── controllers/        # Route controllers
├── models/             # Database models
├── public/             # Static files
├── routes/             # Route definitions
├── services/           # Business logic
├── utils/              # Utility functions
├── views/              # View templates
├── docs/               # Documentation
│   ├── en/            # English documentation
│   └── tr/            # Turkish documentation
├── tests/              # Test files
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore file
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## Development

### Coding Standards

- Follow ESLint configuration
- Use async/await for asynchronous operations
- Follow RESTful API design principles
- Write unit tests for new features

### Testing

Run tests with:
```bash
npm test
```

### Database Management

- Migrations: `npm run db:migrate`
- Seeds: `npm run db:seed`
- Rollback: `npm run db:rollback`

## Deployment

See the [Deployment Guide](docs/en/deployment-guide/deployment-guide.md) for detailed instructions on deploying the application.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@bilanapp.com or open an issue in the repository.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Handlebars](https://handlebarsjs.com/)
- [Jest](https://jestjs.io/)
