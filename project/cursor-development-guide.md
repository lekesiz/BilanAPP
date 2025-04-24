# Skills Assessment Platform - Development Guide for Cursor

## Project Overview

This document provides comprehensive instructions for developing a Skills Assessment Platform using Cursor IDE and Gemini 2.5 Pro. The platform allows consultants to manage beneficiaries throughout their skills assessment process, including appointment scheduling, questionnaire management, messaging, and document sharing.

## Getting Started with Cursor and Gemini 2.5 Pro

### Setting Up Your Environment

1. **Install Cursor IDE**

   - Download from [cursor.sh](https://cursor.sh)
   - Install and set up your preferences

2. **Configure Gemini 2.5 Pro in Cursor**

   - Open Cursor settings
   - Navigate to AI settings
   - Select Gemini 2.5 Pro as your AI model
   - Enter your API key if required

3. **Clone the Project Repository**
   - Create a new repository on GitHub (if not already done)
   - Clone it to your local machine using Cursor's Git integration
   - Set up the initial project structure

## Project Structure

Create the following directory structure in your project:

```
skills-assessment-platform/
├── bin/                  # Server startup scripts
├── config/               # Configuration files
├── controllers/          # Route controllers
├── database/             # Database files
├── middlewares/          # Custom middleware functions
├── models/               # Data models
├── public/               # Static assets (CSS, JS, images)
├── routes/               # Route definitions
├── scripts/              # Utility scripts
├── uploads/              # Uploaded files
├── views/                # Handlebars templates
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── app.js                # Main application file
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Development Workflow with Cursor and Gemini 2.5 Pro

### 1. Leveraging Gemini 2.5 Pro for Code Generation

Cursor's integration with Gemini 2.5 Pro allows you to generate code efficiently. Here's how to use it effectively:

- **Use Clear Prompts**: When asking Gemini to generate code, be specific about what you need
- **Provide Context**: Include relevant information about your project structure and requirements
- **Iterate**: Generate code in smaller chunks and refine as needed
- **Review Generated Code**: Always review and understand the code before implementing it

Example prompt for generating a model:

```
Create a User model for a Node.js application using SQLite3. The model should include fields for id, firstName, lastName, email, password (hashed), userType (consultant or beneficiary), createdAt, and updatedAt. Include methods for finding, creating, updating, and deleting users.
```

### 2. Using Cursor's Features for Efficient Development

Cursor offers several features that can enhance your development workflow:

- **AI Command (Cmd+K/Ctrl+K)**: Use this to ask questions about your code or generate new code
- **AI Autocomplete**: Let Gemini suggest code completions as you type
- **Code Explanation**: Highlight code and ask Gemini to explain it
- **Refactoring**: Ask Gemini to refactor or optimize your code
- **Documentation Generation**: Generate comments and documentation for your code

### 3. Step-by-Step Development Process

Follow this process to develop each component of the application:

1. **Define the Model**: Use Gemini to help create the data model
2. **Implement the Controller**: Generate controller code with proper error handling
3. **Create the Routes**: Define API endpoints and connect them to controllers
4. **Design the Views**: Create Handlebars templates for the user interface
5. **Test the Feature**: Verify that everything works as expected
6. **Refine and Optimize**: Use Gemini to suggest improvements

## Specific Implementation Guidelines

### Database Implementation

Use the following prompt to generate the database initialization script:

```
Create a SQLite3 database initialization script for a skills assessment platform. The script should create tables for Users, Beneficiaries, Appointments, Messages, Questionnaires, Questions, Answers, and Documents with appropriate fields and relationships as described in the TODO list.
```

### Authentication System

For implementing authentication with Passport.js:

```
Generate code for implementing user authentication in a Node.js Express application using Passport.js with local strategy. Include routes and controllers for login, logout, and session management. The user model is already defined with fields for email, password (hashed), and userType.
```

### Frontend Development

For creating responsive UI components:

```
Create a Handlebars template for a dashboard page that displays a summary of beneficiaries, upcoming appointments, and recent messages. The template should be responsive and use Bootstrap 5 for styling.
```

## Testing and Debugging

Use Gemini 2.5 Pro to help with testing and debugging:

- **Generate Test Cases**: Ask Gemini to create test cases for your functions
- **Debug Issues**: When you encounter errors, ask Gemini to help identify the cause
- **Code Review**: Have Gemini review your code for potential issues or improvements

Example prompt for debugging:

```
I'm getting the following error when trying to create a new beneficiary: [paste error]. Here's my controller code: [paste code]. Can you help me identify and fix the issue?
```

## Deployment Preparation

When preparing for deployment, use Gemini to:

- Generate production configuration files
- Create deployment scripts
- Optimize your application for production
- Set up security best practices

## Best Practices for Working with Gemini 2.5 Pro in Cursor

1. **Break Down Complex Tasks**: Instead of asking Gemini to generate a large amount of code at once, break it down into smaller, manageable pieces
2. **Provide Sufficient Context**: Always include relevant information about your project structure and requirements
3. **Be Specific**: Clearly describe what you want Gemini to do
4. **Iterate and Refine**: Use Gemini's suggestions as a starting point and refine as needed
5. **Learn from Generated Code**: Take time to understand the code Gemini generates to improve your own skills

## Troubleshooting Common Issues

- **Model Not Found**: Ensure your import paths are correct and the model file exists
- **Database Connection Errors**: Check your database configuration and ensure the database file exists
- **Authentication Issues**: Verify your Passport.js configuration and session setup
- **Template Rendering Problems**: Check for syntax errors in your Handlebars templates

If you encounter issues, use Gemini to help troubleshoot by providing the error message and relevant code.

## Conclusion

By following this guide and leveraging the power of Cursor IDE with Gemini 2.5 Pro, you can efficiently develop a comprehensive Skills Assessment Platform. The AI-assisted workflow will help you write better code faster, while still maintaining control over the development process.

Remember to refer to the detailed TODO list for specific implementation tasks and requirements.
