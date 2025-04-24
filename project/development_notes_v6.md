# 🛠️ Project Audit – Cursor-Ready Development Checklist (Bilan de Compétences App)

This document contains all missing features and enhancement suggestions (V6). Each section represents a functional module or UI component of the platform.

---

## 📬 8. Messaging Module (Conversations)

- [ ] Backend logic for unread message counter is missing (currently only visual).
- [ ] `participant.id` inconsistencies: sometimes it's user ID, sometimes beneficiary ID. Needs normalization.
- [ ] No delete/archive options for messages – message list grows indefinitely.
- [ ] No support for file attachments (PDF, .docx, etc.).
- [ ] No inline replies or thread views for grouped conversations.
- [ ] No internal messaging support between consultants or with admin.
- [ ] Suggested subjects dropdown for beneficiaries could improve UX.

---

## 🧱 9. Layout & Homepage (main.hbs, auth.hbs, index.hbs)

- [ ] `renderScripts` exists only in `main.hbs`; should also be added to `auth.hbs`.
- [ ] Layouts are responsive but lack accessibility (a11y) enhancements (e.g., aria-label, contrast).
- [ ] Homepage is informative but lacks links to signup form or guided onboarding.
- [ ] Mobile rendering needs testing – long card titles may overflow.

---

## ❗ 10. Error Handling (error.hbs)

- [ ] No contextual redirection based on error type:
  - Admin → /admin/users
  - Beneficiary → /profile
  - Auth error → /login
- [ ] Error logging (status, stacktrace) not visible
- [ ] No dedicated 403 / 404 / 500 pages

---

## 🧑‍💻 11. Consultant & Beneficiary Dashboards

- [ ] Beneficiary dashboard only shows progress chart; lacks AI insights (plan, suggestions, synthesis).
- [ ] Consultant dashboard lacks KPI metrics (e.g., synthèses generated).
- [ ] No integration of conversation replies or appointment feedback into dashboards.

---

## 🧠 Suggested Immediate Tasks

- [ ] Implement backend + visual badge logic for unread messages
- [ ] Add file attachment support in messages
- [ ] Add signup/demo/help buttons to homepage
- [ ] Create separate error views (403.hbs, 404.hbs, 500.hbs)
- [ ] Add AI summary widgets to dashboards (recent plans, careers, etc.)

---

## 📂 12. Navigation & Dropdown Systems

| Component             | Status     | Note                                                |
| --------------------- | ---------- | --------------------------------------------------- |
| `adminDropdown.hbs`   | ✅ Done    | Well defined                                        |
| `aiToolsDropdown.hbs` | ✅ Done    | Fully functional                                    |
| `reportDropdown.hbs`  | ⚠️ Partial | `active` logic not always accurate on dynamic pages |
| Breadcrumbs           | ❌ Missing | Implement breadcrumb navigation per page hierarchy  |

---

## ✉️ 13. Flash Messaging System

- [ ] Ensure global flash message component is rendered in all layout files
- [ ] Create specific error views for `403`, `404`, and `500` cases

---

## 📄 14. Shared Components

| Component                                       | Status                                               |
| ----------------------------------------------- | ---------------------------------------------------- |
| `checklistItem.hbs`                             | ✅ Good                                              |
| `pagination.hbs`                                | ✅ Good                                              |
| `beneficiary_details_appointments/messages.hbs` | ⚠️ Missing “View All” buttons                        |
| `reportDropdown.hbs`                            | ❌ Consultant-only – should be visible to admins too |

---

## 🔧 15. Header & Footer

- [ ] Add `aria-current`, alt texts, and screen-reader compatibility
- [ ] Test navbar dropdown visibility on all breakpoints

---

## 📈 16. AI Usage & Reports

- [ ] AI usage statistics missing from report dropdown for admin
- [ ] Dashboard lacks visual breakdown of AI tool usage

---

## 💳 17. Credit & Forfait Management

- [ ] No filters in credit logs (AI, manual, admin, questionnaire)
- [ ] No warning or UI block when user exceeds credit limit
- [ ] No daily/weekly AI usage cap indicator
- [ ] Add forfait upgrade request button
- [ ] Visual enhancement of forfait features needed

---

## 👤 18. Profile Settings

- [ ] Email is locked – clarify in login or profile info
- [ ] No avatar or photo upload
- [ ] No 2FA or password strength meter
- [ ] No redirect confirmation after password update

---

## 📊 19. Reports Dashboard

- [ ] No export to PDF for dashboards (Chart.js)
- [ ] No filters (e.g., date picker, user segmentation)
- [ ] Empty report section – add AI usage, top consultants, overdue items
- [ ] Forfait report chart only listed, not visual (no pie/bar)

---

## ⚙️ 20. Settings Page

- [ ] “Other settings” placeholder is unused
- [ ] Recommended additions:
  - Notification preferences
  - Language/time format selection
  - AI assistant on/off toggle

---

## 📌 Strategic Enhancements

| Module          | Suggestion                                                   |
| --------------- | ------------------------------------------------------------ |
| AI Usage        | Tag each `AiAnalysis` record: planned, cancelled, completed  |
| Graph Export    | Use `html2canvas` + `jsPDF` for downloading Chart.js visuals |
| Consultant KPIs | Show “synthèses per month”, “AI calls per beneficiary” etc.  |

---

## 📝 21. Questionnaire Module

### ✅ Overall

- Fully functional: create, assign, respond, categorize, view results
- Dynamic question addition UX is very good

### 📋 Issues

- [ ] No PDF/CSV export for results
- [ ] No reporting metrics like assignment stats per coach
- [ ] No auto-assign/reminder by forfait level
- [ ] No AI analysis/summarization of answers
- [ ] Question type mismatch: `scale/checkbox` vs `rating/multiple_choice`
- [ ] No access restriction types (coach-only vs beneficiary-only)
- [ ] No drag-drop question ordering
- [ ] No scoring system on questions

### 💡 Additional Modules

- [ ] Questionnaire Analytics Dashboard
- [ ] AI Answer Interpretation Module
- [ ] Questionnaire-RDV auto-correlation module

---

Generated by ChatGPT for Mikail @netzinformatique.fr — April 2025
