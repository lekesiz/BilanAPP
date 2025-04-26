# BilanApp Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Installation Guide](#installation-guide)
3. [User Guide](#user-guide)
4. [Development Guide](#development-guide)
5. [Database Documentation](#database-documentation)
6. [Testing Guide](#testing-guide)
7. [Deployment Guide](#deployment-guide)
8. [Project Status](#project-status)
9. [Roadmap](#roadmap)

## Project Overview

BilanApp is a web platform for managing "Bilan de Compétences" (Skills Assessment) processes in France. This application helps consultants manage beneficiaries, appointments, documents, questionnaires, and communication throughout the assessment lifecycle.

### Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** Sequelize ORM with SQLite
- **Templating:** Handlebars
- **Authentication:** Passport.js (Local Strategy)
- **Password Hashing:** Bcrypt
- **File Uploads:** Multer
- **AI Integration:** OpenAI
- **Other:** dotenv, connect-flash, morgan, cookie-parser, debug

### Features
- **User Roles:** Consultant, Beneficiary (user account), Admin
- **Consultant Dashboard:** Overview for consultants
- **Beneficiary Management:** CRUD operations, status/phase tracking
- **Appointment Tracking:** Manage appointments linked to beneficiaries and consultants
- **Document Management:** Upload and manage documents related to beneficiaries
- **Questionnaire Management:** Create and assign questionnaires to beneficiaries
- **Messaging System:** Basic communication features
- **Reporting Module:** Statistics for consultants
- **Package/Subscription System:** Different tiers potentially unlocking features
- **Credit System:** Track and deduct credits for specific actions
- **AI-Powered Draft Generation:** Utilize OpenAI to generate draft synthesis and action plan documents
- **AI Usage Limits:** Control the number of AI generations based on user subscription/package

## Installation Guide

See [Installation Guide](user/installation.md) for detailed instructions.

## User Guide

See [User Guide](user/user-guide.md) for detailed instructions on using the application.

## Development Guide

See [Development Guide](development/development-guide.md) for information on contributing to the project.

## Database Documentation

See [Database Documentation](development/database.md) for information about the database structure and relationships.

## Testing Guide

See [Testing Guide](development/testing.md) for information about testing the application.

## Deployment Guide

See [Deployment Guide](deployment/deployment.md) for information about deploying the application.

## Project Status

See [Project Status](development/status.md) for current project status and recent changes.

## Roadmap

See [Roadmap](development/roadmap.md) for future plans and upcoming features. 