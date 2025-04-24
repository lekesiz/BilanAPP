# Bilan de Compétences Platform

A web platform for managing "Bilan de Compétences" (Skills Assessment) processes in France. This application helps consultants manage beneficiaries, appointments, documents, questionnaires, and communication throughout the assessment lifecycle.

This project is currently considered an MVP (Minimum Viable Product).

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Sequelize ORM with SQLite
- **Templating:** Handlebars
- **Authentication:** Passport.js (Local Strategy)
- **Password Hashing:** Bcrypt
- **File Uploads:** Multer
- **AI Integration:** OpenAI
- **Other:** dotenv, connect-flash, morgan, cookie-parser, debug

## Features

- **User Roles:** Consultant, Beneficiary (user account), Admin (implied).
- **Consultant Dashboard:** Overview for consultants.
- **Beneficiary Management:** CRUD operations, status/phase tracking (Preliminary, Investigation, Conclusion), detailed profiles including education, experience, notes, consent tracking, agreement tracking, checklists per phase.
- **Appointment Tracking:** Manage appointments linked to beneficiaries and consultants.
- **Document Management:** Upload and manage documents related to beneficiaries.
- **Questionnaire Management:** Create and assign questionnaires to beneficiaries.
- **Messaging System:** Basic communication features.
- **Reporting Module:** Statistics for consultants (beneficiary counts by phase/status, upcoming appointments/follow-ups, overdue questionnaires, missing consents, package distribution).
- **Package/Subscription System (`Forfait`):** Different tiers potentially unlocking features (e.g., AI, reporting access, beneficiary limits).
- **Credit System (`CreditLog`):** Track and deduct credits for specific actions (e.g., AI generation).
- **AI-Powered Draft Generation:** Utilize OpenAI to generate draft synthesis and action plan documents based on beneficiary data.
- **AI Usage Limits:** Control the number of AI generations based on user subscription/package.
- **Middleware:** Authentication, authorization (consultant role, package level access), credit deduction, AI limit checks.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lekesiz/BilanAPP
    cd bilan-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    - Create a `.env` file in the root directory. You can copy `.env.example` if it exists (it should be created - see TODO).
    - Add the following required variables:
      ```dotenv
      SESSION_SECRET=your_strong_session_secret
      # Add other necessary variables like:
      # OPENAI_API_KEY=your_openai_api_key
      # DATABASE_URL= # Likely not needed as SQLite is used via config/database.js
      # PORT=3000 # Optional, defaults to 3000
      ```
4.  **Database Setup:**
    - This project uses SQLite, and the database file is expected at `database.sqlite` in the root directory.
    - **Important:** The application does _not_ automatically create or migrate the database schema (`sequelize.sync()` is not used in `bin/www`).
    - You need to ensure the `database.sqlite` file exists and has the correct tables defined according to the Sequelize models in the `models/` directory. You might need a separate script or manual process for initial schema creation.

## Usage

- **Development:**
  ```bash
  npm run dev
  ```
  This uses `nodemon` to automatically restart the server on file changes.
- **Production:**
  ```bash
  npm start
  ```

The application should be running on `http://localhost:3000` (or the port specified in `PORT` environment variable).

_(Note: Default login credentials for development might need to be documented here if available)_

## Project Structure

```
.
├── bin/              # Startup script (www)
├── config/           # Configuration files (database, passport, handlebars helpers)
├── controllers/      # (Currently empty) Intended for request handling logic
├── database/         # Potentially for database related files (e.g., migrations - currently empty)
├── middlewares/      # Custom middleware (auth, credits, permissions, limits)
├── models/           # Sequelize model definitions and associations (index.js)
├── node_modules/     # NPM dependencies
├── public/           # Static assets (CSS, JS, images)
├── routes/           # Express route definitions
├── services/         # Business logic services (aiService, creditService)
├── views/            # Handlebars templates (.hbs)
│   ├── layouts/
│   ├── partials/
│   └── ... (view directories matching routes)
├── .env.example      # Example environment variables file (Should be created)
├── .gitignore        # Git ignore rules
├── app.js            # Express application setup
├── database.sqlite   # SQLite database file
├── docker-compose.yml # Docker Compose config
├── Dockerfile        # Dockerfile for building image
├── package-lock.json # NPM lock file
├── package.json      # Project metadata and dependencies
├── README.md         # This file
├── TODO.md           # Project tasks list
└── ... (Other documentation files: DOCUMENTATION.md, GUIDE_DOCKER.md, INSTALLATION.md)
```

## Contributing

(Add contribution guidelines if applicable)

## License

MIT (As specified in `package.json`)
