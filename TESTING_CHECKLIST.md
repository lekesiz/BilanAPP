# BilanApp Testing Checklist

This checklist tracks the testing process based on the user guide.

**I. Consultant Role Tests**

- [x] **Login:** Log in with a consultant account (e.g., `consultant@test.com`).
- [x] **Dashboard:** Verify the dashboard loads correctly after login and shows relevant information.
- [x] **List Beneficiaries:** Navigate to the "Bénéficiaires" page. Verify that only beneficiaries assigned to this consultant are listed. *(Note: Page loads, but verification pending due to lack of other consultant data)*.
- [x] **View Beneficiary Details:** Click on a beneficiary from the list to view their details page. Check if information loads correctly.
- [x] **List Questionnaires:** Navigate to the "Questionnaires" page. Verify questionnaires created by or assigned for this consultant are listed. Test filters if available.
- [x] **Create New Questionnaire:** Attempt to create a new draft questionnaire (title, category suffice). Verify it's created successfully and listed as "Draft".
- [x] **Add Question:** Go to the created draft questionnaire's detail/edit page and add a few questions of different types (text, radio). Verify successful addition.
- [x] **Assign Questionnaire:** Attempt to assign the draft questionnaire to a beneficiary from its detail page. Check credit deduction and status change to "Pending".
- [x] **View Questionnaire Results:** *(Requires a completed questionnaire)* Go to the questionnaire list, find a "Completed" questionnaire assigned by this consultant, and click to view results. Verify answers are displayed.
- [ ] **Delete Questionnaire:** *(Optional/Caution)* Find a "Draft" questionnaire on the list or details page. Click the "Supprimer" button and confirm. Verify it's removed from the list. *(Note: Error - Invalid CSRF token when attempting to delete)*
- [x] **List Messages:** Navigate to the "Messages" page. Check if existing conversations (if any) are listed.
- [x] **Send New Message:** Attempt to send a message to a listed beneficiary via "New Message". Check for success message and redirection.
- [x] **View Conversation:** Click on a conversation from the message list. Verify message history loads correctly.
- [x] **List Appointments:** Navigate to the "Rendez-vous" page. Verify appointments are listed.
- [ ] **Create New Appointment:** Go to `/appointments/add`. Select a beneficiary, fill in details (type, date, time), and save. Verify success message and list update. *(Note: Error - '/appointments/new' and '/appointments/add' routes return 404 error)*
- [x] **List Documents:** Navigate to the "Documents" page. Check if the page loads correctly (even if empty).
- [ ] **Upload Document (If applicable):** If an upload mechanism exists on the Documents page or Beneficiary details page, attempt to upload a test file. Verify success. *(Note: Error - Upload document feature returns CSRF token error)*
- [x] **Logout:** Log out from the system.

**II. Beneficiary Role Tests**

- [x] **Login:** Log in with a beneficiary account (e.g., the one assigned a questionnaire/message).
- [ ] **Dashboard:** Check if the assigned questionnaire or incoming message appears on the dashboard. *(Note: Failed - Pending questionnaires/appointments not displayed correctly. Issue logged.)*
- [x] **List/View Questionnaire:** Verify the assigned questionnaire appears on the "Questionnaires" page.
- [x] **Answer Questionnaire:** Open the assigned questionnaire, answer all questions, and submit. Check for success message and status change to "Completed".
- [x] **View Questionnaire Results:** Verify you can view the results (your answers) for the completed questionnaire.
- [x] **List Messages:** Check if the message from the consultant (if sent) appears on the "Messages" page.
- [x] **Send New Message:** Send a message to the consultant via "New Message". Verify success.
- [x] **View Conversation:** Check the conversation history with the consultant.
- [x] **List Appointments:** Navigate to the "Rendez-vous" page. Verify appointments created for this beneficiary are listed.
- [x] **List Documents:** Navigate to the "Documents" page (or relevant profile section). Verify documents shared with this beneficiary are listed.
- [x] **Logout:** Log out from the system.

**III. Admin Role Tests**

- [x] **Login:** Log in with an admin account.
- [x] **List Beneficiaries:** Verify that *all* beneficiaries (not just those assigned to one consultant) are listed on the "Bénéficiaires" page.
- [x] **List Questionnaires:** Verify that *all* questionnaires are listed on the "Questionnaires" page.
- [x] **Send Message:** Go to "New Message". Verify that *all* beneficiaries are listed as potential recipients and that the admin can successfully send a message to a beneficiary not assigned to them directly. *(Note: Message lists/conversations are not displayed for admin users, but message creation works successfully)*
- [x] **User Management (If available):** If an admin panel or user management section exists, check if you can list users and access user management features.
- [x] **Logout:** Log out from the system.

**Known Issues / TODO (End of Testing):**

*   Consultant Dashboard: Layout/alignment issues observed in screenshots.
*   Admin User Creation: `/admin/users/add` form clears without feedback or saving.
*   Homepage (`/`): Top navigation links for `/login` and `/register` are broken (404 error).
*   Beneficiary Dashboard: Pending questionnaires and/or appointments are not displayed correctly.
*   Appointment Creation: `/appointments/new` and `/appointments/add` routes return 404 error.
*   Document Upload: Feature returns CSRF token error.
*   Questionnaire Deletion: Feature returns invalid CSRF token error.
*   Admin Messages: Message lists/conversations are not displayed for admin users, although message creation works. 