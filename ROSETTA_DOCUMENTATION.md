# Rosetta
© Philip Shih 2025

Rosetta calls Google's Gemini API to craft structured medical notes. Inputs are deidentified using Google Cloud Data Loss Prevention (DLP) API.

---

### **Getting Started with Rosetta**
Rosetta is organized into collapsible sections.

####  Input
Input all pertinent clinical details here – HPI, exam findings, lab results, imaging interpretations, etc.
*   **De-identify Button**:
    *   Click the "De-identify" icon (top-right of the input area).
    *   Rosetta securely routes inputs to Google Cloud DLP for thorough de-identification. The anonymized text replaces your original input.
*   **Update Existing Note?**:
    *   Check this option to add to or reformat a previous note.
    *   A dropdown list of your saved notes will appear. Select a note to load its content.
    *   Use the adjacent refresh icon to fetch the latest list of saved notes.

#### Template
*   **Manual Templates (Dropdown)**:
    *   Choose from a list of your saved manual templates (e.g., "General SOAP Note") to quickly structure your note.
    *   Selecting "None (Use General Structure)" will not apply a specific manual template.
*   **Edit Selected Manual**:
    *   After selecting a manual from the dropdown, this button appears.
    *   Click it to load the content of the selected manual into the "Custom Template" textarea below, allowing you to view and modify it.
*   **Delete Selected Manual**:
    *   Appears when a manual is selected from the dropdown.
    *   Click to delete the currently selected manual template from the server (a confirmation prompt will appear).
*   **Custom Template Area (Textarea)**:
    *   Paste any specific format, an EPIC SmartPhrase, or the content of a manual loaded for editing here. This will be used as the primary template if populated.
*   **Save Changes**:
    *   This button appears after you've clicked "Edit Selected Manual" and the template content is loaded into the "Custom Template" area.
    *   Click it to save any modifications you've made back to the *original* manual template file that was loaded. The button text will indicate which file is being saved (e.g., "Save Changes to general_soap").
*   **Save as New Manual**:
    *   Use this button to save the current content of the "Custom Template" textarea as a brand new manual template.
    *   You will be prompted to enter a name for your new manual.
*   **Clear**:
    *   Clears the content of the "Custom Template" textarea.
    *   If you were editing a loaded manual, this also resets the editing state (the "Save Changes" button will disappear).

#### Options
*   Select any combination of options for your output.
    *   **Output**: Select for SHN (Short-hand Notation), VSHN (Very Short-hand), or structure your Assessment & Plan by problem.
    *   **Reasoning**: Include full pathophysiologic reasoning or cite relevant clinical guidelines.
    *   **Documentation**: Specify SOAP, H&P, Discharge Summary, or Pre-op note.
    *   **Context**: Adapt note generation for various specialties (Derm, Peds, IM, etc.).
    *   **Features**: Request initial history questions, a list of missing data, and more.
    *   **Security**: Confirm de-identification, convert dates to relative time, and use standard abbreviations.
   
#### Generate
*   The right-arrow button (<i class="fas fa-angle-right"></i>). Click it after providing your input and selecting options.
*   Rosetta compiles everything and sends it to the Gemini LLM via the secure backend.

#### Output
*   **Model Impression**: Displays LLM's preliminary reasoning before the final note. Also shows backend status messages.

#### Note
*   Completed notes appear here.
*   **Copy Button**: Click the <i class="fas fa-copy"></i> icon (top-right of the note area) to instantly copy the note to your clipboard.

#### Saved Notes
*   **Refresh List**: Get the latest list of your saved notes.
*   **Delete All Notes**:
    *   Clean up your archive.
*  

#### Incognito Mode
*   For on-screen privacy, toggle the switch at the top-right of Rosetta to make input and outputs white.
---

### **Technology Powering Your Assistant**
*   **Intelligent Note Generation**: State-of-the-art AI from Google's Gemini Pro.
*   **Secure De-identification**: Robust privacy protection using Google Cloud Data Loss Prevention (DLP) API.

---
*Rosetta was created by Philip Shih as a test of functionality. Exercise your clinical judgment by reviewing and verifying AI-generated content.*
