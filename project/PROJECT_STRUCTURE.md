# Bilan de Compétences Platform - Project Structure

This document provides an overview of the project structure for the Bilan de Compétences platform to help you understand the codebase organization.

## Directory Structure

```
bilan-app/
├── bin/                    # Server startup scripts
├── config/                 # Configuration files
├── controllers/            # Controller logic (currently minimal)
├── database/               # Database files (SQLite)
├── middlewares/            # Express middleware functions
├── models/                 # Sequelize data models
├── public/                 # Static assets (CSS, JS, images)
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   └── uploads/            # Uploaded files (documents, etc.)
├── routes/                 # Express route handlers
├── scripts/                # Utility scripts
├── views/                  # Handlebars view templates
│   ├── auth/               # Authentication-related views
│   ├── dashboard/          # Dashboard views
│   ├── layouts/            # Layout templates
│   └── partials/           # Reusable view components
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── app.js                  # Main application file
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Docker build instructions
├── package.json            # NPM dependencies and scripts
└── README.md               # Project documentation
```

## Key Files

### Configuration

- **app.js**: Main application entry point that sets up Express, middleware, and routes
- **config/database.js**: Database connection configuration
- **config/passport.js**: Authentication configuration using Passport.js
- **.env**: Environment variables for configuration

### Models

The application uses Sequelize ORM with the following models:

- **models/User.js**: User account information (consultants and beneficiaries)
- **models/Beneficiary.js**: Beneficiary profile information
- **models/Appointment.js**: Appointment scheduling and details
- **models/Message.js**: Internal messaging system
- **models/Questionnaire.js**: Questionnaire definitions
- **models/Question.js**: Individual questions within questionnaires
- **models/Answer.js**: Responses to questionnaire questions
- **models/Document.js**: Document metadata for file uploads
- **models/index.js**: Sequelize model initialization and relationships

### Routes

- **routes/index.js**: Main routes and homepage
- **routes/auth.js**: Authentication routes (login, logout)
- **routes/dashboard.js**: Dashboard routes for consultants and beneficiaries
- **routes/beneficiaries.js**: Beneficiary management
- **routes/appointments.js**: Appointment scheduling and management
- **routes/messages.js**: Internal messaging system
- **routes/questionnaires.js**: Questionnaire creation and completion

### Middleware

- **middlewares/auth.js**: Authentication middleware (ensureAuthenticated, ensureConsultant, ensureBeneficiary)

### Views

- **views/layouts/main.hbs**: Main layout template
- **views/layouts/auth.hbs**: Authentication layout template
- **views/partials/**: Header, footer, and message components
- **views/auth/**: Login and registration views
- **views/dashboard/**: Consultant and beneficiary dashboard views

## Data Model Relationships

```
User
 ├── hasOne Beneficiary (if userType is 'beneficiary')
 └── hasMany Appointments (if userType is 'consultant')

Beneficiary
 ├── belongsTo User
 ├── belongsTo User (as consultant)
 ├── hasMany Appointments
 ├── hasMany Questionnaires
 └── hasMany Documents

Appointment
 ├── belongsTo User (as consultant)
 └── belongsTo Beneficiary

Message
 ├── belongsTo User (as consultant)
 └── belongsTo Beneficiary

Questionnaire
 ├── belongsTo User (as creator)
 ├── belongsTo Beneficiary
 └── hasMany Questions

Question
 ├── belongsTo Questionnaire
 └── hasMany Answers

Answer
 ├── belongsTo Question
 └── belongsTo Beneficiary

Document
 ├── belongsTo User (as uploadedBy)
 └── belongsTo Beneficiary
```

## Authentication Flow

1. User navigates to `/auth/login`
2. User submits credentials
3. Passport.js authenticates using local strategy
4. On success, user is redirected to `/dashboard`
5. Dashboard route checks user type and redirects to appropriate view
6. Authentication middleware protects routes requiring login

## Request Flow

1. Client makes request to a route
2. Express router receives the request
3. Authentication middleware verifies user session
4. Route handler processes the request:
   - Retrieves data from database using Sequelize models
   - Processes form submissions
   - Handles file uploads
5. Route handler renders appropriate view with data
6. Response is sent to client

## Missing Views and Functionality

While the routes and models are well-defined, several view templates are missing or incomplete:

- Views for beneficiary management (list, add, edit, details)
- Views for appointment management (list, add, edit, details, calendar)
- Views for messaging system (inbox, conversation)
- Views for questionnaire system (list, create, edit, complete, results)
- Views for document management (upload, list, details)

These missing views are the primary focus areas for continued development, as outlined in the TODO.md file.

## Development Workflow

1. Implement missing view templates
2. Add client-side JavaScript for interactive features
3. Enhance existing route handlers as needed
4. Add new routes for additional functionality
5. Extend models with additional fields or relationships as required
6. Test thoroughly with different user types

## Testing

Currently, the application does not have automated tests. Adding tests should be a priority for future development:

- Unit tests for models
- Integration tests for routes
- End-to-end tests for critical user flows

## Deployment

The application includes Docker configuration for containerized deployment:

- **Dockerfile**: Defines the container image
- **docker-compose.yml**: Orchestrates the application and its dependencies
- **GUIDE_DOCKER.md**: Instructions for Docker deployment

For non-Docker deployment, the application can be run directly with Node.js using the scripts defined in package.json.
