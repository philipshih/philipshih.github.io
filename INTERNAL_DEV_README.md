# Internal Development README for philipshih.github.io & Rosetta Application

## 1. Project Overview

This project is the personal website/portfolio for Philip Shih, built using Jekyll and hosted on GitHub Pages. It includes a sophisticated AI-assisted medical note generation application named "Rosetta."

**Rosetta Application**:
Rosetta allows users to input patient information, select various options and templates, and generate structured medical notes using Google's Gemini LLM. It also features PII de-identification via Google Cloud DLP and management of saved notes and templates.

## 2. Key Technologies

*   **Website**: Jekyll (static site generator)
*   **Frontend**: HTML, CSS, JavaScript (vanilla JS)
*   **Rosetta Backend**: Python (Flask framework)
*   **AI Services**:
    *   Note Generation: Google Gemini API (`google-generativeai` library)
    *   De-identification: Google Cloud Data Loss Prevention (DLP) API (`google-cloud-dlp` library)
*   **Markdown Parsing (Docs)**: Marked.js (client-side)

## 3. Directory Structure Highlights

*   `./` (Root):
    *   `_config.yml`: Jekyll site configuration.
    *   `index.md`: Main landing page (uses `_layouts/about.html`).
    *   `rosetta_backend.py`: Flask application for the Rosetta backend.
    *   `ROSETTA_DOCUMENTATION.md`: User-facing documentation for the Rosetta app (Markdown).
    *   `INTERNAL_DEV_README.md`: This file.
    *   `requirements.txt`: Python dependencies for the backend.
*   `_includes/`:
    *   `head.html`: Common HTML head content, including CSS links.
*   `_layouts/`:
    *   `base.html`: Core HTML structure for most pages. Contains the main Rosetta application UI (`#shihGptMdAppContainer`) and its associated JavaScript.
    *   `about.html`: Layout used by `index.md`. Previously contained some Rosetta modal logic, now mostly for content structure.
*   `smartphrase_templates/`: Stores predefined `.txt` templates used by Rosetta (e.g., `general_soap.txt`). Managed via Rosetta UI.
*   `rosetta_outputs/` (relative to `BASE_NOTES_PATH` in backend): Default directory where generated notes are saved by `rosetta_backend.py`.
*   `assets/`:
    *   `css/`: Site-wide and specific CSS files (e.g., `main.scss`).
    *   `js/`: (If any global JS files are used, though most Rosetta JS is in `_layouts/base.html`).
    *   `img/`: Images for the site.

## 4. Rosetta Application Flow & Key Components

### 4.1. Accessing Rosetta
*   The Rosetta interface is embedded within `_layouts/base.html`.
*   It's revealed by entering the password `E916!` into the `#secret-password` input field in the site's top navigation bar.
*   The `checkPassword()` JavaScript function in `_layouts/base.html` handles this, showing the `#shihGptMdAppContainer` div.

### 4.2. Frontend (UI & Core Logic in `_layouts/base.html`)
*   **Main Container**: `#shihGptMdAppContainer` (initially hidden).
*   **Core JavaScript**: Located within a `<script>` tag at the end of `_layouts/base.html`. The main initialization function is `initializeShihGptMdApp()`.
*   **Key HTML Element IDs for Rosetta UI**:
    *   `#patientInfoInput`: Textarea for patient clinical data.
    *   `#deidentifyPatientInfoBtn`: Button to trigger de-identification of text in `#patientInfoInput`.
    *   `#enableUpdateModeCheckbox_rosetta`: Checkbox to enable updating an existing note.
    *   `#existingNotesDropdown_rosetta`: Dropdown to select an existing note for update.
    *   `#refreshNotesButton_rosetta`: Button to refresh the existing notes dropdown.
    *   `#templateSelector`: Dropdown for predefined SmartPhrase templates.
    *   `#epicSmartPhraseInput`: Textarea for custom templates.
    *   `#saveCustomTemplateButton`: Button to save custom template.
    *   `#clearCustomTemplateButton`: Button to clear custom template textarea.
    *   `#checkboxOptionsContainer`: Houses various checkboxes for generation options.
    *   `#generatePromptButton`: Main button (<i class="fas fa-angle-right"></i>) to trigger note generation.
    *   `#modelImpressionArea`: Textarea for LLM "thoughts" and status messages.
    *   `#mainOutputArea`: Textarea for the final generated note.
    *   `#copyNoteButton`: Button to copy the final note.
    *   `#serverNotesDisplayList`: `<ul>` to display list of saved notes from the server.
    *   `#refreshServerNotesListButton`: Button to refresh the displayed list of saved notes.
    *   `#deleteAllNotesButton`: Button to delete all saved notes.
    *   `#hideTextCheckbox`: "Incognito" mode switch.
    *   `#rosettaHelpButton`: Button (info icon) to open the documentation modal.
    *   `#rosettaDocumentationModal`: Modal for displaying documentation.
    *   `#rosettaDocumentationContent`: Div inside modal where `ROSETTA_DOCUMENTATION.md` content is rendered.
    *   `#closeDocModalButton`: Button to close the documentation modal.

### 4.3. Backend Interaction (`rosetta_backend.py`)
*   **Backend URL**: Defined in JavaScript constant `ROSETTA_BACKEND_URL` (e.g., `https://rosetta-backend.onrender.com`).
*   **Key Endpoints Called by Frontend**:
    *   `POST /generate_note`: Submits patient data, template info, and options to generate a note.
    *   `POST /api/deidentify_text`: Sends text for de-identification.
    *   `GET /list_saved_notes`: Fetches the list of saved note filenames.
    *   `GET /get_note/<filename>`: Fetches the content of a specific saved note.
    *   `POST /api/delete_all_notes`: Deletes all saved notes (requires `{"confirm": true}` in body).
    *   `GET /list_smartphrase_templates`: Fetches list of predefined templates.
    *   `POST /save_smartphrase_template`: Saves a new custom template.
    *   `POST /delete_smartphrase_template`: Deletes a custom template.

## 5. Backend Details (`rosetta_backend.py`)

*   **Framework**: Flask
*   **CORS**: Enabled for all routes (`CORS(app)`).
*   **Note Generation**:
    *   `handle_generate_note()`: Constructs a detailed prompt by combining system instructions, core operational instructions, and dynamic frontend request data (patient info, template, options).
    *   `get_llm_response()`: Sends the combined prompt to the Gemini API and processes the response, extracting model "thoughts" and the main note.
*   **De-identification**:
    *   `deidentify_text_gcp_dlp()`: Uses Google Cloud DLP client to redact PII from text.
*   **File Management**:
    *   `generate_filename()`: Creates filenames for new notes using the format: `rosetta_note_{YYYYMMDD}_{HHMM}_{SERVICE}.txt`.
    *   `save_note_to_file()`: Saves note content to the `OUTPUT_NOTES_DIRECTORY`.
    *   `list_saved_notes()`: Lists `.txt` files, sorted lexicographically descending (newest first due to filename format).
    *   `get_note()`: Serves content of a specific note.
    *   `delete_all_notes()`: Deletes all `.txt` files in `OUTPUT_NOTES_DIRECTORY`.
    *   Similar functions exist for managing smartphrase templates in `SMARTPHRASE_TEMPLATES_DIR`.
*   **Required Environment Variables**:
    *   `GEMINI_API_KEY` or `GOOGLE_API_KEY`: For Gemini API access.
    *   `GCP_PROJECT_ID`: Google Cloud Project ID for DLP.
    *   `GOOGLE_APPLICATION_CREDENTIALS`: Path to GCP service account JSON key file with DLP permissions.
    *   `BASE_NOTES_PATH` (Optional): Base path for `rosetta_outputs/` and `smartphrase_templates/`. Defaults to `.` (current directory of the script).

## 6. Development & Deployment Notes

*   The main website is a Jekyll static site, typically deployed via GitHub Pages by pushing to the `main` (or `gh-pages`) branch.
*   The Rosetta backend (`rosetta_backend.py`) is a separate Python Flask application. It needs to be deployed on a server environment that supports Python (e.g., OnRender, Heroku, Google Cloud Run, AWS EC2/Lambda, etc.).
*   **Crucial**: When deploying the backend, ensure all required environment variables (API keys, GCP project info, credentials path) are correctly set in the server's environment.
*   The `OUTPUT_NOTES_DIRECTORY` and `SMARTPHRASE_TEMPLATES_DIR` paths in the backend are relative to `BASE_NOTES_PATH` or the script's location. Ensure these directories are writable by the backend process.
*   Font Awesome icons are used in the UI; ensure the Font Awesome CSS is correctly linked (typically in `_includes/head.html` or `_layouts/base.html`).

This internal README should provide a good starting point for understanding and working on the Rosetta application and its integration into the website.
