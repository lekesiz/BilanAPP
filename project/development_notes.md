# 🛠️ Project Audit – AI-Powered Bilan de Compétences Platform

This document summarizes all identified issues, missing features, and improvement suggestions across all modules of the platform. It serves as a technical roadmap for development and can be used within Cursor or any code-based IDE for issue tracking and planning.

---

## 🔍 1. AI Engine & Prompt Architecture

- Extract all hardcoded prompts from `aiService.js` into modular `.md` or `.json` files under `/prompts`.
- Introduce prompt versioning (e.g., `strategy-plan-v2.md`) and log `promptVersion` and `modelUsed` in `AiAnalysis`.
- Create wrappers: `askOpenAI()`, `askClaude()`, `askGemini()` for cross-provider support.
- Implement dynamic model selection based on user forfait type or config.
- Add AI fallback mechanisms if provider is unreachable.

---

## 🧠 2. Questionnaire System

- Enable export of completed questionnaire responses to PDF or CSV.
- Normalize question type definitions between `new.hbs`, `edit.hbs`, and `complete.hbs`.
- Add visual sorting or drag-drop reordering for questions in edit view.
- Implement AI summarizer for long text answers to provide automated insights.
- Assign weight/score to questions and display total score for assessments.
- Track questionnaire statistics in admin dashboard (assigned, completed, overdue).

---

## 💳 3. Credit & Forfait Management

- Introduce daily/weekly credit usage limit indicators per user.
- Warn users on UI when trying to initiate AI analysis with insufficient credits.
- Add ability to filter credit logs by source (AI, Admin, Questionnaires, Documents).
- Provide forfait upgrade request option visible on profile.

---

## 🧾 4. Profile & Settings

- Add avatar upload or Gravatar integration.
- Introduce Two-Factor Authentication (2FA) support.
- Improve password strength indicators.
- Add notification preferences and default language/date format settings.

---

## 📈 5. Reporting & Analytics

- Add export buttons (PDF/CSV) to all Chart.js dashboards.
- Include filters for timeframe (last 7 days, last 30 days) and data segmentation.
- Track AI module usage per consultant and visualize as graph or heatmap.
- Add KPIs to dashboards: AI calls per beneficiary, most used tools, avg time per bilan.

---

## 📬 6. Messaging System

- Add message deletion, archiving and conversation pinning features.
- Display unread badge count in header or dashboard.
- Allow attachments (PDF, .docx) to messages.
- Integrate inline reply view or threads for grouped messages.

---

## 🗂️ 7. General UX Improvements

- Add breadcrumb navigation to all subpages (e.g., Dashboard > Beneficiaries > Jean Dupont).
- Implement dark mode and accessibility improvements (aria-labels, contrast, focus order).
- Allow all tables to be sortable and paginated via frontend (DataTables or custom).

---

Generated by ChatGPT - project analysis assistant for Mikail @netzinformatique.fr
