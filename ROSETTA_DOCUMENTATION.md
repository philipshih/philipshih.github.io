# Rosetta: Your AI-Powered Clinical Note Assistant

## Streamline Clinical Documentation

Rosetta calls Google's Gemini API to craft accurate, concise, and professionally structured medical notes deidentified using Google Cloud Data Loss Prevention (DLP) API.

---

### **Getting Started with Rosetta**
Rosetta is organized into collapsible sections.

####  Input
Input all pertinent clinical details here – HPI, exam findings, lab results, imaging interpretations, etc.
*   **De-identify Button**:
    *   Click the <i class="fas fa-user-shield"></i> icon (top-right of the input area).
    *   Rosetta securely sends your text to Google Cloud DLP for thorough de-identification. The cleaned, anonymized text replaces your original input.
*   **Update Existing Note?**:
    *   Check this option to add to or reformat a previous note.
    *   A dropdown list of your saved notes will appear. Select a note to load its content.
    *   Use the adjacent refresh icon to fetch the latest list of saved notes.

#### Template
*   **Predefined Templates**: Choose from standard templates like "General SOAP Note" to quickly structure your note.
*   **Custom Template Area**: Paste a specific format or EPIC SmartPhrase here to override predefined selections.
*   **Save & Clear**: Save your custom templates for future use or remove past notes.

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
