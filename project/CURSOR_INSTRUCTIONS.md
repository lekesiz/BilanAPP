# Using Cursor with Gemini 2.5 Pro for Bilan de Compétences Platform

This guide provides instructions on how to use Cursor IDE with Gemini 2.5 Pro to continue development of the Bilan de Compétences platform.

## Getting Started with Cursor

### Installation and Setup

1. Download and install Cursor from [cursor.sh](https://cursor.sh/)
2. Open the Bilan de Compétences project folder in Cursor
3. Connect Cursor to your Gemini 2.5 Pro account:
   - Open Cursor settings
   - Navigate to AI settings
   - Select Gemini 2.5 Pro as your AI model
   - Enter your API key if required

### Cursor AI Features for This Project

#### Code Completion

- Use `Ctrl+Enter` (or `Cmd+Enter` on Mac) to trigger AI code completion
- When working on a new feature, start by writing a comment describing what you want to implement
- Example: `// Implement file upload functionality for the messaging system`

#### Code Generation

- Use `/` command to generate entire code blocks
- Example prompts:
  - `/Generate a Handlebars template for the appointment calendar view`
  - `/Create a route handler for document uploads`
  - `/Write a Sequelize query to find appointments by date range`

#### Code Explanation

- Select code and use `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac) to explain selected code
- Useful for understanding existing functionality before extending it

#### Refactoring

- Select code and use `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to refactor
- Example prompts:
  - `Optimize this database query for better performance`
  - `Refactor this function to use async/await instead of promises`

## Working with Gemini 2.5 Pro

### Effective Prompting Strategies

#### For Code Generation

- Be specific about the framework and libraries used (Express, Sequelize, Handlebars)
- Include details about the data models involved
- Specify the desired functionality clearly
- Example:
  ```
  Generate an Express route handler for uploading documents.
  It should:
  - Use the Document model (fields: id, name, type, path, size, uploadedBy, beneficiaryId)
  - Support file size validation (max 10MB)
  - Store files in the /uploads directory
  - Return appropriate success/error responses
  - Include proper authentication middleware
  ```

#### For Debugging

- Provide the error message
- Include relevant code context
- Explain what you've already tried
- Example:

  ```
  I'm getting this error when trying to create a new appointment:
  "SequelizeForeignKeyConstraintError: Cannot add or update a child row"

  Here's my route handler code:
  [paste code]

  I've verified that the beneficiaryId exists in the database.
  ```

#### For Feature Implementation

- Break down complex features into smaller tasks
- Provide context about related existing functionality
- Be clear about the expected user experience
- Example:

  ```
  I want to implement a calendar view for appointments. The existing appointment model has:
  - date (DateTime)
  - duration (Integer, minutes)
  - title (String)
  - beneficiaryId (Integer, foreign key)

  I need a monthly calendar view that shows appointments as events, allows clicking on days to see details, and provides navigation between months.
  ```

### Project-Specific Guidance

#### File Structure Conventions

- Routes go in `/routes` directory
- View templates go in `/views` directory (organized by feature)
- Models go in `/models` directory
- Static assets go in `/public` directory
- Middleware functions go in `/middlewares` directory

#### Naming Conventions

- Routes: `featureName.js` (e.g., `appointments.js`)
- Views: `featureName/actionName.hbs` (e.g., `appointments/calendar.hbs`)
- Models: PascalCase singular (e.g., `Appointment.js`)
- CSS classes: kebab-case (e.g., `appointment-calendar`)
- JavaScript functions: camelCase (e.g., `loadAppointments()`)

#### Code Style Guidelines

- Use async/await for asynchronous operations
- Use try/catch blocks for error handling
- Include comments for complex logic
- Follow the existing pattern for route handlers:
  ```javascript
  router.get("/path", ensureAuthenticated, async (req, res) => {
    try {
      // Logic here
      res.render("view", { data });
    } catch (err) {
      console.error(err);
      req.flash("error", "User-friendly error message");
      res.redirect("/fallback-path");
    }
  });
  ```

## Implementation Workflow

### Step 1: Understand the Existing Code

- Review the models to understand data structure
- Examine related routes to understand current functionality
- Check existing views to maintain UI consistency

### Step 2: Plan Your Implementation

- Identify which files need to be created or modified
- Determine what database queries will be needed
- Plan the user interface changes

### Step 3: Implement Backend Logic

- Create/modify routes
- Implement database operations
- Add validation and error handling

### Step 4: Create Frontend Views

- Create Handlebars templates
- Add necessary CSS styles
- Implement client-side JavaScript if needed

### Step 5: Test Your Implementation

- Test happy path scenarios
- Test error cases
- Verify UI on different screen sizes

## Example: Implementing Document Upload Functionality

Here's a step-by-step example of how to implement document upload functionality using Cursor and Gemini 2.5 Pro:

1. **Understand the requirements**

   - Documents need to be uploaded and associated with beneficiaries
   - Need to support different file types
   - Need to implement access control

2. **Check existing models**

   - Review the Document model in `/models/Document.js`
   - Understand its relationships with other models

3. **Create routes**

   - In Cursor, create or open `/routes/documents.js`
   - Use Gemini to generate route handlers:
     - `/Generate route handler for document upload`
     - `/Generate route handler for document download`
     - `/Generate route handler for document listing`

4. **Create views**

   - Create templates in `/views/documents/`
   - Use Gemini to generate Handlebars templates:
     - `/Generate Handlebars template for document upload form`
     - `/Generate Handlebars template for document listing`

5. **Add client-side validation**

   - Create JavaScript for client-side validation
   - Use Gemini to generate validation code:
     - `/Generate client-side validation for document upload form`

6. **Test the implementation**
   - Upload various file types
   - Verify access control works correctly
   - Test error handling

## Troubleshooting Common Issues

### Database Connection Issues

- Check database configuration in `.env` file
- Verify Sequelize models are properly defined
- Check for foreign key constraints

### View Rendering Problems

- Verify the correct data is being passed to the template
- Check for typos in variable names in Handlebars templates
- Ensure layouts and partials are properly referenced

### Authentication Issues

- Check middleware usage in routes
- Verify session configuration
- Test with different user types (consultant vs. beneficiary)

## Getting Help

If you encounter issues that you can't resolve with Cursor and Gemini 2.5 Pro:

1. Check the Express.js, Sequelize, and Handlebars documentation
2. Search for similar issues on Stack Overflow
3. Try different prompts with Gemini 2.5 Pro
4. Break down complex problems into smaller, more specific questions

Remember to refer to the TODO.md file for a list of features that need to be implemented and their priorities.
