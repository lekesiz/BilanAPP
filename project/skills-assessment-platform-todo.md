# Skills Assessment Platform - Detailed TODO List for Cursor Development

This TODO list provides a comprehensive breakdown of all tasks required to develop a Skills Assessment Platform using Cursor IDE and Gemini 2.5 Pro. Each task is designed to be clear and actionable, making it easy to track progress and implement features systematically.

## 1. Project Setup and Configuration

### 1.1 Environment Setup

- [ ] Install Node.js (v14 or higher) and npm (v6 or higher)
- [ ] Create project directory structure using Cursor's file management
- [ ] Initialize npm project with `package.json`
- [ ] Install core dependencies:
  ```bash
  npm install express express-handlebars sqlite3 passport passport-local bcryptjs connect-flash cookie-parser express-session dotenv morgan multer
  ```
- [ ] Create `.env` file with environment variables:
  ```
  PORT=3000
  NODE_ENV=development
  SESSION_SECRET=your_session_secret
  ```
- [ ] Create `.gitignore` file:
  ```
  node_modules/
  .env
  database/*.sqlite
  uploads/*
  !uploads/.gitkeep
  ```

### 1.2 Project Structure

- [ ] Create the following directory structure using Cursor's file explorer:
  ```
  /bin                  # Server startup scripts
  /config               # Configuration files
  /controllers          # Route controllers
  /database             # Database files
  /middlewares          # Custom middleware functions
  /models               # Data models
  /public               # Static assets (CSS, JS, images)
  /routes               # Route definitions
  /scripts              # Utility scripts
  /uploads              # Uploaded files
  /views                # Handlebars templates
  ```
- [ ] Create placeholder files in each directory to maintain structure

## 2. Database Design and Implementation

### 2.1 Database Configuration

- [ ] Create `config/database.js` for database connection:

  ```javascript
  const sqlite3 = require("sqlite3").verbose();
  const path = require("path");
  const fs = require("fs");

  // Ensure database directory exists
  const dbDir = path.join(__dirname, "..", "database");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "skills_assessment.sqlite");
  const db = new sqlite3.Database(dbPath);

  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON");

  module.exports = db;
  ```

### 2.2 Database Schema Implementation

- [ ] Create `scripts/init-db.js` to initialize database tables
- [ ] Implement Users table creation
- [ ] Implement Beneficiaries table creation
- [ ] Implement Appointments table creation
- [ ] Implement Messages table creation
- [ ] Implement Questionnaires table creation
- [ ] Implement Questions table creation
- [ ] Implement Answers table creation
- [ ] Implement Documents table creation
- [ ] Add sample data for testing

## 3. Authentication System

### 3.1 User Model

- [ ] Create `models/User.js` with fields:
  - id (primary key)
  - firstName
  - lastName
  - email (unique)
  - password (hashed)
  - userType (consultant or beneficiary)
  - createdAt
  - updatedAt
- [ ] Implement methods for CRUD operations

### 3.2 Authentication Configuration

- [ ] Create `config/passport.js` for Passport.js configuration
- [ ] Implement local strategy for email/password authentication
- [ ] Set up serialization and deserialization of user

### 3.3 Authentication Middleware

- [ ] Create `middlewares/auth.js` with authentication middleware:
  - ensureAuthenticated
  - ensureConsultant
  - ensureBeneficiary

### 3.4 Authentication Routes and Controllers

- [ ] Create `routes/auth.js` for authentication routes
- [ ] Implement login route and controller
- [ ] Implement logout route and controller
- [ ] Implement registration route and controller (if needed)

### 3.5 Authentication Views

- [ ] Create `views/auth/login.hbs` for login page
- [ ] Style login form with Bootstrap
- [ ] Implement client-side validation

## 4. Beneficiary Management

### 4.1 Beneficiary Model

- [ ] Create `models/Beneficiary.js` with fields:
  - id (primary key)
  - firstName
  - lastName
  - email
  - phone
  - status (initial, in_progress, completed)
  - currentPhase (preliminary, investigation, conclusion)
  - notes
  - consultantId (foreign key to Users)
  - createdAt
  - updatedAt
- [ ] Implement methods for CRUD operations

### 4.2 Beneficiary Routes and Controllers

- [ ] Create `routes/beneficiaries.js` for beneficiary routes
- [ ] Implement route for listing beneficiaries
- [ ] Implement route for adding new beneficiaries
- [ ] Implement route for viewing beneficiary details
- [ ] Implement route for editing beneficiaries
- [ ] Implement route for deleting beneficiaries

### 4.3 Beneficiary Views

- [ ] Create `views/beneficiaries/index.hbs` for listing beneficiaries
- [ ] Create `views/beneficiaries/add.hbs` for adding new beneficiaries
- [ ] Create `views/beneficiaries/details.hbs` for viewing beneficiary details
- [ ] Create `views/beneficiaries/edit.hbs` for editing beneficiaries
- [ ] Style all views with Bootstrap

## 5. Appointment Management

### 5.1 Appointment Model

- [ ] Create `models/Appointment.js` with fields:
  - id (primary key)
  - title
  - date
  - duration
  - location
  - isOnline
  - meetingLink
  - notes
  - status (scheduled, completed, cancelled)
  - consultantId (foreign key to Users)
  - beneficiaryId (foreign key to Beneficiaries)
  - createdAt
  - updatedAt
- [ ] Implement methods for CRUD operations

### 5.2 Appointment Routes and Controllers

- [ ] Create `routes/appointments.js` for appointment routes
- [ ] Implement route for listing appointments
- [ ] Implement route for adding new appointments
- [ ] Implement route for viewing appointment details
- [ ] Implement route for editing appointments
- [ ] Implement route for cancelling appointments
- [ ] Implement route for marking appointments as completed

### 5.3 Appointment Views

- [ ] Create `views/appointments/index.hbs` for listing appointments
- [ ] Create `views/appointments/add.hbs` for adding new appointments
- [ ] Create `views/appointments/details.hbs` for viewing appointment details
- [ ] Create `views/appointments/edit.hbs` for editing appointments
- [ ] Style all views with Bootstrap
- [ ] Implement date and time picker for appointment scheduling

## 6. Messaging System

### 6.1 Message Model

- [ ] Create `models/Message.js` with fields:
  - id (primary key)
  - content
  - isRead
  - senderType (consultant or beneficiary)
  - consultantId (foreign key to Users)
  - beneficiaryId (foreign key to Beneficiaries)
  - createdAt
  - updatedAt
- [ ] Implement methods for CRUD operations

### 6.2 Message Routes and Controllers

- [ ] Create `routes/messages.js` for message routes
- [ ] Implement route for listing conversations
- [ ] Implement route for viewing a specific conversation
- [ ] Implement route for sending messages
- [ ] Implement route for marking messages as read

### 6.3 Message Views

- [ ] Create `views/messages/index.hbs` for listing conversations
- [ ] Create `views/messages/conversation.hbs` for viewing and sending messages
- [ ] Style all views with Bootstrap
- [ ] Implement real-time message updates (optional)

## 7. Questionnaire System

### 7.1 Questionnaire Models

- [ ] Create `models/Questionnaire.js` with fields:
  - id (primary key)
  - title
  - description
  - type (skills, interests, personality, values)
  - status (draft, active, completed)
  - dueDate
  - creatorId (foreign key to Users)
  - beneficiaryId (foreign key to Beneficiaries)
  - createdAt
  - updatedAt
- [ ] Create `models/Question.js` with fields:
  - id (primary key)
  - text
  - type (text, multiple_choice, rating, yes_no)
  - options (for multiple choice questions)
  - required
  - order
  - questionnaireId (foreign key to Questionnaires)
  - createdAt
  - updatedAt
- [ ] Create `models/Answer.js` with fields:
  - id (primary key)
  - value
  - notes
  - questionId (foreign key to Questions)
  - beneficiaryId (foreign key to Beneficiaries)
  - createdAt
  - updatedAt
- [ ] Implement methods for CRUD operations for all models

### 7.2 Questionnaire Routes and Controllers

- [ ] Create `routes/questionnaires.js` for questionnaire routes
- [ ] Implement route for listing questionnaires
- [ ] Implement route for creating new questionnaires
- [ ] Implement route for editing questionnaires
- [ ] Implement route for adding/editing questions
- [ ] Implement route for completing questionnaires
- [ ] Implement route for viewing questionnaire results

### 7.3 Questionnaire Views

- [ ] Create `views/questionnaires/index.hbs` for listing questionnaires
- [ ] Create `views/questionnaires/create.hbs` for creating new questionnaires
- [ ] Create `views/questionnaires/edit.hbs` for editing questionnaires
- [ ] Create `views/questionnaires/questions.hbs` for managing questions
- [ ] Create `views/questionnaires/complete.hbs` for completing questionnaires
- [ ] Create `views/questionnaires/results.hbs` for viewing results
- [ ] Style all views with Bootstrap
- [ ] Implement dynamic form generation for different question types

## 8. Document Management

### 8.1 Document Model

- [ ] Create `models/Document.js` with fields:
  - id (primary key)
  - title
  - description
  - filePath
  - fileType
  - fileSize
  - category
  - uploadedBy (foreign key to Users)
  - beneficiaryId (foreign key to Beneficiaries)
  - createdAt
  - updatedAt
- [ ] Implement methods for CRUD operations

### 8.2 Document Routes and Controllers

- [ ] Create `routes/documents.js` for document routes
- [ ] Implement route for listing documents
- [ ] Implement route for uploading documents
- [ ] Implement route for downloading documents
- [ ] Implement route for deleting documents

### 8.3 Document Views

- [ ] Create `views/documents/index.hbs` for listing documents
- [ ] Create `views/documents/upload.hbs` for uploading documents
- [ ] Style all views with Bootstrap

### 8.4 File Upload Functionality

- [ ] Configure Multer for file uploads in `middlewares/upload.js`:

  ```javascript
  const multer = require("multer");
  const path = require("path");
  const fs = require("fs");

  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  // Create upload middleware
  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
      // Accept common file types
      const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
      );

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error("Only supported file types are allowed"));
    },
  });

  module.exports = upload;
  ```

## 9. Dashboard Implementation

### 9.1 Dashboard Routes and Controllers

- [ ] Create `routes/dashboard.js` for dashboard routes
- [ ] Implement consultant dashboard route and controller
- [ ] Implement beneficiary dashboard route and controller

### 9.2 Dashboard Views

- [ ] Create `views/dashboard/consultant.hbs` for consultant dashboard
- [ ] Create `views/dashboard/beneficiary.hbs` for beneficiary dashboard
- [ ] Style dashboards with Bootstrap
- [ ] Implement dashboard widgets for key information

## 10. User Interface and Design

### 10.1 Layout and Navigation

- [ ] Create `views/layouts/main.hbs` for main layout
- [ ] Create `views/partials/header.hbs` for navigation bar
- [ ] Create `views/partials/footer.hbs` for footer
- [ ] Create `views/partials/messages.hbs` for flash messages

### 10.2 Static Assets

- [ ] Create CSS files in `public/css/`
- [ ] Create JavaScript files in `public/js/`
- [ ] Add Bootstrap and other frontend libraries
- [ ] Implement responsive design

### 10.3 Client-side JavaScript

- [ ] Implement form validation
- [ ] Create date picker functionality
- [ ] Implement dynamic UI interactions
- [ ] Add AJAX for asynchronous operations

## 11. Error Handling and Validation

### 11.1 Server-side Validation

- [ ] Create validation middleware for forms
- [ ] Implement data sanitization
- [ ] Add error handling for database operations

### 11.2 Error Handling

- [ ] Create global error handler middleware
- [ ] Create `views/error.hbs` for error pages
- [ ] Implement 404 page for not found routes
- [ ] Add logging for errors

## 12. Application Integration

### 12.1 Main Application File

- [ ] Create `app.js` with Express configuration
- [ ] Set up middleware (session, flash, etc.)
- [ ] Configure Handlebars as view engine
- [ ] Register all routes
- [ ] Implement error handling

### 12.2 Server Startup

- [ ] Create `bin/www` for server startup
- [ ] Configure port and host settings
- [ ] Implement graceful shutdown

## 13. Testing

### 13.1 Manual Testing

- [ ] Test all routes and functionality
- [ ] Verify form validation
- [ ] Test error handling
- [ ] Check responsive design on different devices

### 13.2 Bug Fixing

- [ ] Address any issues found during testing
- [ ] Verify fixes with additional testing

## 14. Deployment Preparation

### 14.1 Environment Configuration

- [ ] Update `.env` file for production
- [ ] Configure production database settings
- [ ] Implement security best practices

### 14.2 Documentation

- [ ] Create README.md with project information
- [ ] Document installation and setup process
- [ ] Add usage instructions
- [ ] Create API documentation if needed

## 15. Final Steps

### 15.1 Code Review

- [ ] Review all code for consistency
- [ ] Check for security vulnerabilities
- [ ] Optimize performance where needed
- [ ] Ensure code is well-commented

### 15.2 Final Testing

- [ ] Perform end-to-end testing of all features
- [ ] Verify all requirements are met
- [ ] Test edge cases and error scenarios

### 15.3 Deployment

- [ ] Deploy application to production server
- [ ] Verify deployment is successful
- [ ] Monitor for any issues
- [ ] Create backup of initial deployment
