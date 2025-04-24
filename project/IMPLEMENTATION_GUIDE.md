# Bilan de Compétences Platform - Implementation Guide

This document provides step-by-step instructions for implementing the missing functionalities in the Bilan de Compétences platform. Follow these guidelines when working with Gemini 2.5 Pro and Cursor.

## Getting Started with Implementation

Before diving into specific features, make sure you:

1. Understand the project structure (see PROJECT_STRUCTURE.md)
2. Review the existing models and routes
3. Familiarize yourself with the existing views and layouts
4. Set up your development environment with Cursor and Gemini 2.5 Pro (see CURSOR_INSTRUCTIONS.md)

## Implementation Walkthrough: Beneficiary Management Views

Let's start with implementing the missing beneficiary management views as an example.

### Step 1: Create the Beneficiary List View (beneficiaries/index.hbs)

1. **Create the file structure**:

   ```
   mkdir -p views/beneficiaries
   touch views/beneficiaries/index.hbs
   ```

2. **Implement the view template**:

   Use Cursor with Gemini 2.5 Pro to generate the template with this prompt:

   ```
   Generate a Handlebars template for listing beneficiaries with the following requirements:
   - Should extend the main layout
   - Should display a table of beneficiaries with columns for name, email, status, current phase
   - Should include a search form at the top
   - Should include pagination at the bottom
   - Should have action buttons for view details, edit, and create appointment
   - Should display flash messages for notifications
   ```

3. **Update the route handler** in `routes/beneficiaries.js`:

   The route handler already exists but needs to be enhanced with search, filtering, and pagination:

   ```javascript
   // List of beneficiaries
   router.get("/", ensureAuthenticated, ensureConsultant, async (req, res) => {
     try {
       const page = parseInt(req.query.page) || 1;
       const limit = 10;
       const offset = (page - 1) * limit;

       // Build search query
       const searchQuery = {};
       if (req.query.search) {
         searchQuery[Op.or] = [
           { firstName: { [Op.like]: `%${req.query.search}%` } },
           { lastName: { [Op.like]: `%${req.query.search}%` } },
           { email: { [Op.like]: `%${req.query.search}%` } },
         ];
       }

       // Add filters
       if (req.query.status) {
         searchQuery.status = req.query.status;
       }
       if (req.query.phase) {
         searchQuery.currentPhase = req.query.phase;
       }

       // Always filter by consultant
       searchQuery.consultantId = req.user.id;

       // Get beneficiaries with pagination
       const { count, rows: beneficiaries } = await Beneficiary.findAndCountAll(
         {
           where: searchQuery,
           include: [
             { model: User, as: "user" },
             {
               model: Appointment,
               as: "beneficiaryAppointments",
               limit: 1,
               order: [["date", "DESC"]],
             },
           ],
           limit,
           offset,
           order: [
             ["lastName", "ASC"],
             ["firstName", "ASC"],
           ],
         },
       );

       // Calculate pagination values
       const totalPages = Math.ceil(count / limit);

       res.render("beneficiaries/index", {
         title: "Mes bénéficiaires",
         beneficiaries,
         user: req.user,
         pagination: {
           page,
           totalPages,
           hasNext: page < totalPages,
           hasPrev: page > 1,
         },
         search: req.query.search || "",
         filters: {
           status: req.query.status || "",
           phase: req.query.phase || "",
         },
       });
     } catch (err) {
       console.error(err);
       req.flash(
         "error",
         "Une erreur est survenue lors du chargement des bénéficiaires",
       );
       res.redirect("/dashboard");
     }
   });
   ```

### Step 2: Create the Beneficiary Add Form (beneficiaries/add.hbs)

1. **Create the file**:

   ```
   touch views/beneficiaries/add.hbs
   ```

2. **Implement the view template**:

   Use Cursor with Gemini 2.5 Pro to generate the template with this prompt:

   ```
   Generate a Handlebars template for adding a new beneficiary with the following requirements:
   - Should extend the main layout
   - Should include a form with fields for first name, last name, email, phone, and notes
   - Should include client-side validation
   - Should display flash messages for errors
   - Should have submit and cancel buttons
   ```

3. **Add client-side validation**:

   Create a JavaScript file for validation:

   ```
   touch public/js/beneficiary-form-validation.js
   ```

   Use Cursor with Gemini 2.5 Pro to generate the validation code:

   ```
   Generate client-side validation JavaScript for a beneficiary form with the following requirements:
   - Should validate required fields (first name, last name, email)
   - Should validate email format
   - Should validate phone number format
   - Should display validation errors next to the respective fields
   - Should prevent form submission if validation fails
   ```

4. **Include the validation script** in your template:
   ```html
   <script src="/js/beneficiary-form-validation.js"></script>
   ```

### Step 3: Create the Beneficiary Edit Form (beneficiaries/edit.hbs)

1. **Create the file**:

   ```
   touch views/beneficiaries/edit.hbs
   ```

2. **Implement the view template**:

   Use Cursor with Gemini 2.5 Pro to generate the template with this prompt:

   ```
   Generate a Handlebars template for editing a beneficiary with the following requirements:
   - Should extend the main layout
   - Should include a form with fields for first name, last name, email, phone, and notes
   - Should include dropdown selects for status and current phase
   - Should pre-populate all fields with existing data
   - Should include client-side validation
   - Should display flash messages for errors
   - Should have update, cancel, and delete buttons
   ```

3. **Reuse the same validation script** from the add form.

### Step 4: Create the Beneficiary Details View (beneficiaries/details.hbs)

1. **Create the file**:

   ```
   touch views/beneficiaries/details.hbs
   ```

2. **Implement the view template**:

   Use Cursor with Gemini 2.5 Pro to generate the template with this prompt:

   ```
   Generate a Handlebars template for displaying beneficiary details with the following requirements:
   - Should extend the main layout
   - Should display all beneficiary information in a structured layout
   - Should show upcoming appointments in a table
   - Should show completed questionnaires in a table
   - Should show recent messages
   - Should include action buttons for edit, create appointment, send message, assign questionnaire
   - Should display flash messages for notifications
   ```

3. **Update the route handler** in `routes/beneficiaries.js` to include more related data:

   ```javascript
   // Détails d'un bénéficiaire
   router.get(
     "/:id",
     ensureAuthenticated,
     ensureConsultant,
     async (req, res) => {
       try {
         const beneficiary = await Beneficiary.findOne({
           where: {
             id: req.params.id,
             consultantId: req.user.id,
           },
           include: [
             { model: User, as: "user" },
             {
               model: Appointment,
               as: "beneficiaryAppointments",
               order: [["date", "DESC"]],
               limit: 5,
             },
             {
               model: Questionnaire,
               as: "questionnaires",
               order: [["createdAt", "DESC"]],
               limit: 5,
             },
             {
               model: Message,
               as: "messages",
               order: [["createdAt", "DESC"]],
               limit: 5,
             },
           ],
         });

         if (!beneficiary) {
           req.flash("error", "Bénéficiaire non trouvé");
           return res.redirect("/beneficiaries");
         }

         res.render("beneficiaries/details", {
           title: `Bénéficiaire: ${beneficiary.firstName} ${beneficiary.lastName}`,
           beneficiary,
           user: req.user,
         });
       } catch (err) {
         console.error(err);
         req.flash(
           "error",
           "Une erreur est survenue lors du chargement des détails du bénéficiaire",
         );
         res.redirect("/beneficiaries");
       }
     },
   );
   ```

## Implementation Walkthrough: Document Management

Let's implement the document management functionality as another example.

### Step 1: Create the Document Routes

1. **Create the route file**:

   ```
   touch routes/documents.js
   ```

2. **Implement the route handlers**:

   Use Cursor with Gemini 2.5 Pro to generate the route handlers:

   ```
   Generate Express.js route handlers for document management with the following requirements:
   - Should include routes for listing, uploading, viewing details, and downloading documents
   - Should use the Document model (fields: id, name, type, path, size, uploadedBy, beneficiaryId)
   - Should include authentication middleware
   - Should handle file uploads using multer
   - Should implement proper error handling
   ```

3. **Register the routes** in `app.js`:
   ```javascript
   // Document routes
   const documentsRouter = require("./routes/documents");
   app.use("/documents", documentsRouter);
   ```

### Step 2: Create the Document Views

1. **Create the directory structure**:

   ```
   mkdir -p views/documents
   touch views/documents/index.hbs
   touch views/documents/upload.hbs
   touch views/documents/details.hbs
   ```

2. **Implement the document list view**:

   Use Cursor with Gemini 2.5 Pro to generate the template:

   ```
   Generate a Handlebars template for listing documents with the following requirements:
   - Should extend the main layout
   - Should display a table of documents with columns for name, type, size, upload date, and beneficiary
   - Should include a search and filter form at the top
   - Should include pagination at the bottom
   - Should have action buttons for view details and download
   - Should include an upload button
   - Should display flash messages for notifications
   ```

3. **Implement the document upload form**:

   Use Cursor with Gemini 2.5 Pro to generate the template:

   ```
   Generate a Handlebars template for uploading documents with the following requirements:
   - Should extend the main layout
   - Should include a file upload input with drag-and-drop support
   - Should include a dropdown to select the beneficiary
   - Should include fields for document type and description
   - Should include client-side validation
   - Should display upload progress
   - Should have submit and cancel buttons
   - Should display flash messages for errors
   ```

4. **Implement the document details view**:

   Use Cursor with Gemini 2.5 Pro to generate the template:

   ```
   Generate a Handlebars template for displaying document details with the following requirements:
   - Should extend the main layout
   - Should display document metadata (name, type, size, upload date, uploader, beneficiary)
   - Should include a preview section for supported file types
   - Should have a download button
   - Should include version history if available
   - Should display flash messages for notifications
   ```

### Step 3: Implement File Upload Functionality

1. **Install multer** for file uploads:

   ```
   npm install --save multer
   ```

2. **Create upload directory**:

   ```
   mkdir -p public/uploads
   ```

3. **Configure multer** in the documents route file:

   ```javascript
   const multer = require("multer");
   const path = require("path");

   // Configure storage
   const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       cb(null, "public/uploads/");
     },
     filename: function (req, file, cb) {
       cb(null, `${Date.now()}-${file.originalname}`);
     },
   });

   // Configure upload middleware
   const upload = multer({
     storage: storage,
     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
     fileFilter: function (req, file, cb) {
       // Accept all file types for now
       cb(null, true);
     },
   });
   ```

4. **Implement the upload route handler**:

   ```javascript
   // Upload a document
   router.post(
     "/upload",
     ensureAuthenticated,
     upload.single("document"),
     async (req, res) => {
       try {
         if (!req.file) {
           req.flash("error", "Veuillez sélectionner un fichier");
           return res.redirect("/documents/upload");
         }

         const { beneficiaryId, documentType, description } = req.body;

         // Verify beneficiary exists and user has access
         let beneficiary;
         if (req.user.userType === "consultant") {
           beneficiary = await Beneficiary.findOne({
             where: {
               id: beneficiaryId,
               consultantId: req.user.id,
             },
           });
         } else {
           beneficiary = await Beneficiary.findOne({
             where: {
               userId: req.user.id,
             },
           });
         }

         if (!beneficiary) {
           req.flash("error", "Bénéficiaire non trouvé ou non autorisé");
           return res.redirect("/documents/upload");
         }

         // Create document record
         await Document.create({
           name: req.file.originalname,
           path: req.file.path.replace("public/", "/"),
           type:
             documentType || path.extname(req.file.originalname).substring(1),
           size: req.file.size,
           description: description || "",
           uploadedBy: req.user.id,
           beneficiaryId: beneficiary.id,
         });

         req.flash("success", "Document téléchargé avec succès");
         res.redirect("/documents");
       } catch (err) {
         console.error(err);
         req.flash(
           "error",
           "Une erreur est survenue lors du téléchargement du document",
         );
         res.redirect("/documents/upload");
       }
     },
   );
   ```

5. **Implement the download route handler**:

   ```javascript
   // Download a document
   router.get("/:id/download", ensureAuthenticated, async (req, res) => {
     try {
       let document;

       if (req.user.userType === "consultant") {
         // For consultants, check if they have access to the beneficiary
         document = await Document.findOne({
           where: { id: req.params.id },
           include: [
             {
               model: Beneficiary,
               as: "beneficiary",
               where: { consultantId: req.user.id },
             },
           ],
         });
       } else {
         // For beneficiaries, check if the document belongs to them
         const beneficiary = await Beneficiary.findOne({
           where: { userId: req.user.id },
         });

         if (!beneficiary) {
           req.flash("error", "Profil bénéficiaire non trouvé");
           return res.redirect("/dashboard");
         }

         document = await Document.findOne({
           where: {
             id: req.params.id,
             beneficiaryId: beneficiary.id,
           },
         });
       }

       if (!document) {
         req.flash("error", "Document non trouvé ou non autorisé");
         return res.redirect("/documents");
       }

       // Send the file
       res.download(`public${document.path}`, document.name);
     } catch (err) {
       console.error(err);
       req.flash(
         "error",
         "Une erreur est survenue lors du téléchargement du document",
       );
       res.redirect("/documents");
     }
   });
   ```

## Implementation Walkthrough: Appointment Calendar View

Let's implement the appointment calendar view as a final example.

### Step 1: Create the Calendar View

1. **Create the file**:

   ```
   touch views/appointments/calendar.hbs
   ```

2. **Implement the view template**:

   Use Cursor with Gemini 2.5 Pro to generate the template:

   ```
   Generate a Handlebars template for an appointment calendar with the following requirements:
   - Should extend the main layout
   - Should include a monthly calendar view
   - Should display appointments as events on the calendar
   - Should include navigation to switch between months
   - Should include day, week, and month view options
   - Should allow clicking on days to see appointments
   - Should include a quick-add appointment button
   - Should display flash messages for notifications
   ```

3. **Add the necessary CSS and JavaScript**:

   Install FullCalendar.js for the calendar functionality:

   ```
   npm install --save @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
   ```

   Copy the necessary files to your public directory:

   ```
   mkdir -p public/js/fullcalendar
   cp node_modules/@fullcalendar/core/main.min.js public/js/fullcalendar/
   cp node_modules/@fullcalendar/core/main.min.css public/js/fullcalendar/
   cp node_modules/@fullcalendar/daygrid/main.min.js public/js/fullcalendar/
   cp node_modules/@fullcalendar/daygrid/main.min.css public/js/fullcalendar/
   cp node_modules/@fullcalendar/timegrid/main.min.js public/js/fullcalendar/
   cp node_modules/@fullcalendar/timegrid/main.min.css public/js/fullcalendar/
   cp node_modules/@fullcalendar/interaction/main.min.js public/js/fullcalendar/
   ```

4. **Create the calendar initialization JavaScript**:

   ```
   touch public/js/appointment-calendar.js
   ```

   Use Cursor with Gemini 2.5 Pro to generate the JavaScript:

   ```
   Generate JavaScript code to initialize a FullCalendar calendar for appointments with the following requirements:
   - Should fetch appointment data from an API endpoint
   - Should display appointments with title, time, and beneficiary name
   - Should allow clicking on appointments to view details
   - Should allow clicking on empty day cells to create new appointments
   - Should include navigation between months
   - Should support day, week, and month views
   ```

### Step 2: Add the Calendar Route

1. **Add a new route handler** in `routes/appointments.js`:

   ```javascript
   // Calendar view of appointments
   router.get("/calendar", ensureAuthenticated, async (req, res) => {
     try {
       res.render("appointments/calendar", {
         title: "Calendrier des rendez-vous",
         user: req.user,
       });
     } catch (err) {
       console.error(err);
       req.flash(
         "error",
         "Une erreur est survenue lors du chargement du calendrier",
       );
       res.redirect("/appointments");
     }
   });
   ```

2. **Add an API endpoint** for calendar data:

   ```javascript
   // API endpoint for calendar data
   router.get("/api/calendar", ensureAuthenticated, async (req, res) => {
     try {
       const start = req.query.start; // Start date from FullCalendar
       const end = req.query.end; // End date from FullCalendar

       let appointments;

       if (req.user.userType === "consultant") {
         // For consultants, get all their appointments
         appointments = await Appointment.findAll({
           where: {
             consultantId: req.user.id,
             date: {
               [Op.between]: [new Date(start), new Date(end)],
             },
           },
           include: [{ model: Beneficiary, as: "beneficiary" }],
         });
       } else {
         // For beneficiaries, get their appointments
         const beneficiary = await Beneficiary.findOne({
           where: { userId: req.user.id },
         });

         if (!beneficiary) {
           return res.status(404).json({ error: "Beneficiary not found" });
         }

         appointments = await Appointment.findAll({
           where: {
             beneficiaryId: beneficiary.id,
             date: {
               [Op.between]: [new Date(start), new Date(end)],
             },
           },
           include: [{ model: User, as: "consultant" }],
         });
       }

       // Format appointments for FullCalendar
       const events = appointments.map((appointment) => {
         const endTime = new Date(appointment.date);
         endTime.setMinutes(endTime.getMinutes() + appointment.duration);

         let title = appointment.title;
         if (req.user.userType === "consultant" && appointment.beneficiary) {
           title += ` - ${appointment.beneficiary.firstName} ${appointment.beneficiary.lastName}`;
         } else if (
           req.user.userType === "beneficiary" &&
           appointment.consultant
         ) {
           title += ` - ${appointment.consultant.firstName} ${appointment.consultant.lastName}`;
         }

         return {
           id: appointment.id,
           title: title,
           start: appointment.date,
           end: endTime,
           url: `/appointments/${appointment.id}`,
           backgroundColor:
             appointment.status === "cancelled"
               ? "#f8d7da"
               : appointment.status === "completed"
                 ? "#d4edda"
                 : "#cce5ff",
         };
       });

       res.json(events);
     } catch (err) {
       console.error(err);
       res.status(500).json({ error: "Server error" });
     }
   });
   ```

## General Implementation Tips

### Working with Handlebars Templates

1. **Use layouts and partials** for consistent UI:

   ```handlebars
   {{!-- In your template --}}
   {{#> layouts/main}}
     <div class="container mt-4">
       <h1>{{title}}</h1>
       {{> partials/messages}}

       {{!-- Your content here --}}
     </div>
   {{/layouts/main}}
   ```

2. **Create reusable partials** for common elements:

   ```
   touch views/partials/pagination.hbs
   touch views/partials/search-form.hbs
   touch views/partials/beneficiary-card.hbs
   ```

3. **Use Handlebars helpers** for formatting and conditional logic:

   ```javascript
   // In app.js
   const hbs = require("express-handlebars");

   // Register Handlebars helpers
   const handlebars = hbs.create({
     helpers: {
       formatDate: function (date) {
         return new Date(date).toLocaleDateString("fr-FR");
       },
       formatTime: function (date) {
         return new Date(date).toLocaleTimeString("fr-FR", {
           hour: "2-digit",
           minute: "2-digit",
         });
       },
       eq: function (a, b) {
         return a === b;
       },
       // Add more helpers as needed
     },
   });
   ```

### Working with Forms and Validation

1. **Use Bootstrap form classes** for consistent styling:

   ```handlebars
   <form method="POST" action="/beneficiaries/add">
     <div class="mb-3">
       <label for="firstName" class="form-label">Prénom</label>
       <input
         type="text"
         class="form-control"
         id="firstName"
         name="firstName"
         required
       />
       <div class="invalid-feedback">Ce champ est requis</div>
     </div>
     <!-- More form fields -->
     <button type="submit" class="btn btn-primary">Ajouter</button>
     <a href="/beneficiaries" class="btn btn-secondary">Annuler</a>
   </form>
   ```

2. **Implement client-side validation** with Bootstrap validation classes:

   ```javascript
   // Example validation script
   document.addEventListener("DOMContentLoaded", function () {
     const form = document.querySelector("form");

     form.addEventListener("submit", function (event) {
       if (!form.checkValidity()) {
         event.preventDefault();
         event.stopPropagation();
       }

       form.classList.add("was-validated");
     });

     // Add custom validation for specific fields
     const emailInput = document.getElementById("email");
     emailInput.addEventListener("input", function () {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(emailInput.value)) {
         emailInput.setCustomValidity(
           "Veuillez entrer une adresse email valide",
         );
       } else {
         emailInput.setCustomValidity("");
       }
     });
   });
   ```

3. **Always implement server-side validation** as well:

   ```javascript
   // In your route handler
   router.post(
     "/add",
     ensureAuthenticated,
     ensureConsultant,
     async (req, res) => {
       try {
         const { firstName, lastName, email, phone, notes } = req.body;

         // Validate required fields
         if (!firstName || !lastName || !email) {
           req.flash("error", "Veuillez remplir tous les champs obligatoires");
           return res.redirect("/beneficiaries/add");
         }

         // Validate email format
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
           req.flash("error", "Veuillez entrer une adresse email valide");
           return res.redirect("/beneficiaries/add");
         }

         // Continue with creating the beneficiary
         // ...
       } catch (err) {
         console.error(err);
         req.flash("error", "Une erreur est survenue");
         res.redirect("/beneficiaries/add");
       }
     },
   );
   ```

### Working with Database Queries

1. **Use Sequelize associations** to fetch related data:

   ```javascript
   const beneficiary = await Beneficiary.findOne({
     where: { id: req.params.id },
     include: [
       { model: User, as: "user" },
       { model: Appointment, as: "beneficiaryAppointments" },
       { model: Questionnaire, as: "questionnaires" },
     ],
   });
   ```

2. **Implement pagination** for list views:

   ```javascript
   const page = parseInt(req.query.page) || 1;
   const limit = 10;
   const offset = (page - 1) * limit;

   const { count, rows } = await Model.findAndCountAll({
     where: searchQuery,
     limit,
     offset,
     order: [["createdAt", "DESC"]],
   });

   const totalPages = Math.ceil(count / limit);
   ```

3. **Implement search and filtering**:

   ```javascript
   const searchQuery = {};

   if (req.query.search) {
     searchQuery[Op.or] = [
       { field1: { [Op.like]: `%${req.query.search}%` } },
       { field2: { [Op.like]: `%${req.query.search}%` } },
     ];
   }

   if (req.query.filter) {
     searchQuery.field = req.query.filter;
   }
   ```

## Next Steps After Implementing Core Functionality

Once you've implemented the core missing functionality, consider these enhancements:

1. **Add email notifications** for appointments and messages
2. **Implement real-time features** with Socket.io
3. **Add data visualization** for questionnaire results
4. **Enhance security** with additional authentication features
5. **Optimize performance** with caching and query optimization
6. **Add comprehensive testing** for all functionality

Remember to refer to the TODO.md, MISSING_FUNCTIONALITIES.md, and CURSOR_INSTRUCTIONS.md documents for more detailed guidance on specific tasks and how to use Gemini 2.5 Pro effectively with Cursor.
