# Project Issues & Feature Proposals

This document tracks identified bugs, security vulnerabilities, and proposed advanced features for the Mini Keep Clone project.

---

## 🔴 Identified Issues

### 1. [DONE] XSS Vulnerability in Note Rendering
- **Description**: The application is currently vulnerable to **Cross-Site Scripting (XSS)**. Notes are rendered using `innerHTML` without sanitizing user-provided content. A malicious user could save a note containing a `<script>` tag, which would execute in the browser of any user viewing that note.
- **What needs to be done**: 
    - Implement a sanitization utility or switch to `textContent` for text-only fields.
    - Update `renderNotes` in `frontend/js/app.js` to escape HTML special characters.
- **Acceptance Criteria**: 
    - Notes containing HTML tags (e.g., `<img src=x onerror=alert(1)>`) must render as literal text.
    - No scripts should execute when viewing or searching notes.
- **Status**: Fixed by implementing `escapeHTML` in `frontend/js/app.js`.

### 2. [DONE] Missing Error Handler Middleware
- **Description**: In `backend/server.js`, there is a reference to a non-existent `errorHandler` from `./middleware/authMiddleware`. This leads to inconsistent error responses and potential server crashes or exposure of stack traces.
- **What needs to be done**: 
    - Create a dedicated `errorMiddleware.js` in `backend/middleware/`.
    - Export an `errorHandler` function to catch unhandled async errors and return a formatted JSON response.
    - Update `server.js` to correctly use this middleware.
- **Acceptance Criteria**: 
    - All API errors return a consistent JSON format: `{ "message": "error message", "stack": "..." }`.
    - The server does not crash on unhandled route errors.
- **Status**: Fixed by creating `errorMiddleware.js` and updating `server.js`.

### 3. [DONE] Inability to Edit Note Colors
- **Description**: Users can select a color during note creation, but the edit modal only allows updating the title and description. This prevents users from changing the visual categorization of their notes later.
- **What needs to be done**: 
    - Add color selection options to the edit modal in `frontend/pages/dashboard.html`.
    - Update `openEditModal` and the edit form submission logic in `frontend/js/app.js`.
- **Acceptance Criteria**: 
    - Users can change a note's background color via the edit modal.
    - Updated colors are persisted correctly in the database/in-memory storage.
- **Status**: Fixed by adding color picker to Edit Modal and updating frontend logic.

---

## ✨ Advanced New Features

### 1. Note Archiving & Trash System
- **Description**: Implement an "Archive" and "Trash" system to help users manage clutter without permanent data loss. 
- **What needs to be done**: 
    - Add `isArchived` and `isTrashed` boolean fields to the `Note` model.
    - Add "Archive" and "Move to Trash" actions to the note cards.
    - Create a sidebar for navigating between "Notes", "Archive", and "Trash" views.
- **Acceptance Criteria**: 
    - Archived notes are hidden from the main dashboard.
    - Users can "Restore" notes from Trash or Archive.
    - Trashed notes can be permanently deleted manually.

### 2. Dynamic Labels (Tags) System
- **Description**: Add categorization through custom labels (e.g., "Work", "Personal"). Users can tag notes and filter the dashboard by these labels.
- **What needs to be done**: 
    - Update the `Note` schema to include a `labels` array.
    - Add label creation/selection UI in the note creation and edit forms.
    - Implement a sidebar filter showing all unique labels.
- **Acceptance Criteria**: 
    - Users can add multiple labels to a note.
    - Clicking a label in the sidebar filters the notes grid instantly.
    - Labels are persisted and retrieved correctly from the backend.

### 3. Markdown Support for Rich Text
- **Description**: Transform the plain text description into a rich text editor by supporting Markdown. This allows for bold text, lists, and links.
- **What needs to be done**: 
    - Integrate a lightweight Markdown library (e.g., `marked.js`) in the frontend.
    - Update rendering logic to parse descriptions as Markdown before display.
    - Ensure sanitization is applied during the Markdown parsing process.
- **Acceptance Criteria**: 
    - Input like `**bold**` or `- list` renders as valid HTML formatting.
    - Markdown rendering is safe and does not introduce new XSS vectors.
    - The design remains premium and cohesive with the rich text elements.
