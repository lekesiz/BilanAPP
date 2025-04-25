# BilanApp User Guide

This guide explains how to use the BilanApp application step-by-step for different user roles.

**Table of Contents:**

1.  **General Operations (All Roles)**
    *   Logging In
    *   Password Reset (If available)
    *   Profile Settings
    *   Logging Out
2.  **Consultant Role**
    *   Dashboard
    *   Beneficiary Management
        *   Listing Beneficiaries
        *   Adding a New Beneficiary (If available)
        *   Viewing Beneficiary Details
        *   Updating Beneficiary Status/Phase
    *   Questionnaire Management
        *   Listing Questionnaires
        *   Creating a New Questionnaire (Draft)
        *   Adding/Deleting Questions (While Draft)
        *   Assigning a Questionnaire to a Beneficiary
        *   Viewing Questionnaire Results
        *   Deleting a Questionnaire
    *   Messaging
        *   Listing Messages (Conversations)
        *   Sending a New Message (To Beneficiary)
        *   Viewing a Conversation
    *   Appointment Management (If available)
        *   Listing Appointments
        *   Creating a New Appointment
    *   Document Management (If available)
        *   Viewing/Uploading Documents
3.  **Beneficiary Role**
    *   Dashboard
    *   Questionnaire Actions
        *   Viewing Assigned Questionnaires
        *   Answering a Questionnaire
        *   Viewing Questionnaire Results
    *   Messaging
        *   Listing Messages (Conversation with Consultant)
        *   Sending a New Message (To Consultant)
        *   Viewing a Conversation
    *   Appointment Management (If available)
        *   Viewing Appointments
    *   Document Management (If available)
        *   Viewing/Downloading Documents
4.  **Admin Role**
    *   Overview (Admin Privileges)
    *   User Management (If available)
        *   Listing Users
        *   Adding/Editing/Deleting Users
    *   Viewing Consultant/Beneficiary Data (All)
    *   Messaging (With All Users?)
    *   Questionnaire Management (All Questionnaires?)
    *   System Settings (If available)

---

**1. General Operations (All Roles)**

*   **Logging In:**
    1.  Navigate to the application's login page (`/auth/login`).
    2.  Enter your email address and password.
    3.  Click the "Log In" or similar button.
    4.  Upon successful login, you will be redirected to the dashboard corresponding to your role.
*   **Password Reset (If available):**
    *   The login page usually has a "Forgot Password?" link. If this functionality exists, follow the steps to reset your password (typically involves receiving a link via email).
*   **Profile Settings:**
    1.  Click on "Profile," "Settings," or a similar option, usually found in the user menu in the top-right corner.
    2.  On the opened page, you can update your information like name, surname, or password.
    3.  Click the "Save" or "Update" button.
*   **Logging Out:**
    1.  Click on "Log Out" or a similar option in the user menu in the top-right corner.
    2.  Your session will be terminated, and you will usually be redirected to the login page.

---

**2. Consultant Role**

*   **Dashboard:**
    *   This is the main screen you are redirected to after logging in.
    *   It typically displays recent activities, upcoming appointments (if any), a summary of assigned beneficiaries, etc.
*   **Beneficiary Management:**
    *   **Listing Beneficiaries:**
        1.  Click on the "Beneficiaries" or similar link in the navigation menu.
        2.  You will see a list of all beneficiaries assigned to you, showing basic info like name and status.
        3.  Filtering or search options may be available.
    *   **Adding a New Beneficiary (If available):**
        *   If the system allows adding new beneficiaries, there will be a button like "Add New Beneficiary." Click it and fill in the required information (name, email, etc.) to create a new beneficiary record.
    *   **Viewing Beneficiary Details:**
        1.  Click on a beneficiary's name or a "Details" button in the beneficiary list.
        2.  You will access the detail page containing all the beneficiary's information, progress status, notes, associated questionnaires, documents, and appointments (if any).
    *   **Updating Beneficiary Status/Phase:**
        *   On the beneficiary detail page, there will be fields or buttons to update their progress in the Bilan process (e.g., phase, status).
*   **Questionnaire Management:**
    *   **Listing Questionnaires:**
        1.  Click the "Questionnaires" link in the navigation menu.
        2.  You will see a list of questionnaires you created or assigned to your beneficiaries, showing status (Draft, Pending, Completed), category, etc.
        3.  Filtering options (by status, category, beneficiary) may be available.
    *   **Creating a New Questionnaire (Draft):**
        1.  Click the "Create New Questionnaire" or similar button on the questionnaire list page.
        2.  Enter basic information like title, description, and category.
        3.  The questionnaire is initially created in "Draft" status. After saving, you are usually redirected to the questionnaire detail/edit page.
    *   **Adding/Deleting Questions (While Draft):**
        1.  Go to the detail/edit page of a draft questionnaire.
        2.  In the "Add Question" section, enter the question text, select its type (text, multiple choice, etc.), and provide options if necessary, then save.
        3.  You can delete existing questions using the "Delete" button next to them. *(Note: You usually cannot edit/delete questions after the questionnaire has been assigned)*.
    *   **Assigning a Questionnaire to a Beneficiary:**
        1.  Go to the detail page of a questionnaire.
        2.  Look for an "Assign to Beneficiary" or similar button/section.
        3.  In the form that appears, select a beneficiary from the list. You can optionally set a due date.
        4.  Assignment usually costs a certain amount of credits. Confirm to complete the assignment. The questionnaire status changes to "Pending."
    *   **Viewing Questionnaire Results:**
        1.  Click the "View Results" or similar link next to a questionnaire that has been completed by a beneficiary.
        2.  A page opens displaying the answers provided by the beneficiary.
    *   **Deleting a Questionnaire:**
        *   You can usually only delete questionnaires that are in "Draft" status or assigned questionnaires that haven't been answered yet. Look for a "Delete" button on the list or detail page.
*   **Messaging:**
    *   **Listing Messages (Conversations):**
        1.  Click the "Messages" link in the navigation menu.
        2.  You will see a list of conversations with your beneficiaries (usually showing the last message). Unread messages may be indicated.
    *   **Sending a New Message (To Beneficiary):**
        1.  Click the "New Message" button on the messages page.
        2.  Select the beneficiary you want to message from the "Recipient" list.
        3.  Enter the subject and message content.
        4.  Click the "Send" button.
    *   **Viewing a Conversation:**
        1.  Click on a conversation in the message list.
        2.  The entire message history (sent and received) with that beneficiary is displayed.
        3.  You can also reply directly from this page.
*   **Appointment Management (If available):**
    *   If there is a "Rendez-vous" (Appointments) section in the navigation menu:
    *   You can list appointments, create new ones (selecting a beneficiary, setting date/time), and edit/cancel existing appointments.
*   **Document Management (If available):**
    *   If there is a "Documents" section in the navigation menu:
    *   You can upload, list, and download documents related to beneficiaries (e.g., CVs, reports). Access is often also provided via the respective beneficiary's detail page.

---

**3. Beneficiary Role**

*   **Dashboard:**
    *   This is the main screen you are redirected to after logging in.
    *   It typically shows pending questionnaires assigned to you, recent messages, upcoming appointments (if any), and may provide information about your current phase in the Bilan process.
*   **Questionnaire Actions:**
    *   **Viewing Assigned Questionnaires:**
        1.  You can see questionnaires assigned to you and not yet answered ("Pending" status) on your dashboard or in the "Questionnaires" section of the navigation menu.
    *   **Answering a Questionnaire:**
        1.  Click the "Answer" or similar button next to the questionnaire you want to complete.
        2.  The questionnaire questions and answer fields (text boxes, options, etc.) are displayed.
        3.  Answer all questions carefully.
        4.  Click the "Submit" or "Complete" button at the bottom of the form. Upon successful submission, the questionnaire status changes to "Completed."
    *   **Viewing Questionnaire Results:**
        *   There is usually a "View Results" link for completed questionnaires on the list or detail page, allowing you to see the answers you provided.
*   **Messaging:**
    *   **Listing Messages (Conversation with Consultant):**
        1.  Click the "Messages" link in the navigation menu.
        2.  You will see the conversation history with your assigned consultant.
    *   **Sending a New Message (To Consultant):**
        1.  Click the "New Message" button on the messages page.
        2.  The recipient will automatically be your assigned consultant (usually cannot be changed).
        3.  Enter the subject and message content.
        4.  Click the "Send" button.
    *   **Viewing a Conversation:**
        1.  Click on the conversation with your consultant in the message list to view the full history and reply.
*   **Appointment Management (If available):**
    *   If there is a "Rendez-vous" (Appointments) section, you can list and view the details of appointments created for you by your consultant.
*   **Document Management (If available):**
    *   If there is a "Documents" section or a relevant area in your profile, you can view and download documents shared with you by your consultant.

---

**4. Admin Role**

*(Note: This section is based on common admin functionalities and may be incomplete as admin privileges were not fully examined in the code.)*

*   **Overview (Admin Privileges):**
    *   The Admin role usually has access to and management rights over all data in the system, including viewing all users, beneficiaries, questionnaires, messages, etc.
*   **User Management (If available):**
    *   If there is a "User Management," "Admin Panel," or similar section:
    *   **Listing Users:** Can list all registered users (consultants, beneficiaries, other admins).
    *   **Adding/Editing/Deleting Users:** Can add new users, edit existing users' information (role, plan, status, etc.), or delete users.
*   **Viewing Consultant/Beneficiary Data (All):**
    *   Admin can view the details, progress, and associated data (questionnaires, messages, etc.) of *all* beneficiaries, even if not assigned to a specific consultant they manage.
    *   Can view information and activities of all consultants.
*   **Messaging (With All Users?):**
    *   Admin may have the ability to send messages to any consultant or beneficiary. The recipient selection might be more comprehensive. *(Note: It was mentioned in the logs that the admin message view might not be implemented yet, so this feature could be missing.)*
*   **Questionnaire Management (All Questionnaires?):**
    *   Admin can likely list, view details, and see results for *all* questionnaires in the system, regardless of who created them. They might also have permissions to edit or delete questionnaires.
*   **System Settings (If available):**
    *   There might be a settings panel where the admin can manage global application settings (e.g., default credit costs, email templates, Forfait definitions).

---

This guide covers the basic functionalities of BilanApp. It may need updates as the application evolves or new features are added. If you encounter issues with any step or need more information about a specific function, please ask! 