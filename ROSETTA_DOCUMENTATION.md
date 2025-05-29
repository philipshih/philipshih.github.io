# Rosetta
© Philip Shih 2025

Rosetta calls Google's Gemini API to craft structured medical notes. Inputs are deidentified using Google Cloud Data Loss Prevention (DLP) API.

---

### **Getting Started with Rosetta**
Rosetta is organized into collapsible sections.

#### Incognito Mode
*   For on-screen privacy, toggle the switch at the top-right of Rosetta to make input and outputs white.
####  Input
Input all pertinent clinical details here – HPI, exam findings, lab results, imaging interpretations, etc.
*   **De-identify Button**:
    *   Click the "De-identify" icon (top-right of the input area).
    *   Rosetta securely routes inputs to Google Cloud DLP for de-identification. Anonymized text replaces your original input.
*   **Update Existing Note?**:
    *   Check this option to add to or reformat a previous note.
    *   A dropdown list of your saved notes will appear. Select a note to load its content.

#### Template
*   **Manuals**:
    *   Choose from a list of your saved Manuals (e.g., "General SOAP Note") as a template to structure your note.
    *   Selecting "None (Use General Structure)" will not apply a specific Manual. Notes will be structured based on selected Options and as deemed appropriate.
*   **Edit Selected Manual**:
    *   Loads the content of the selected Manual into the "Custom Template" text area below, allowing you to view and modify existing Manuals.
*   **Delete Selected Manual**:
    *   Click to delete the currently selected Manual from the server.
*   **Custom Template Area (Textarea)**:
    *   Paste any specific format, an EPIC SmartPhrase, or the content of a Manual loaded for editing here. This will be used as the primary template if populated.
*   **Save Changes**:
    *   Save any modifications made back to the *original* Manual file that was loaded. The button text will indicate which file is being saved (e.g., "Save Changes to general_soap").
*   **Save as New Manual**:
    *   Save the current content of the "Custom Template" textarea as a brand new Manual. You will be prompted to enter a name for your new Manual. 
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
*   Rosetta compiles everything and sends it to an LLM hosted by Render via the secure backend.

#### Output
*   **Model Impression**: Displays LLM's preliminary reasoning before the final note and backend status messages.

#### Note
*   Completed notes appear here.
*   **Copy Button**: Click the <i class="fas fa-copy"></i> icon (top-right of the note area) to instantly copy the note to your clipboard.

#### Saved Notes
*   **Refresh List**: Retrieve the latest list of your saved notes.
*   **Delete All Notes**:
    *   Removes all saved notes.
*  
---
*Rosetta was developed by Philip Shih as proof-of-concept. Exercise your clinical judgment by reviewing and verifying AI-generated content.*
