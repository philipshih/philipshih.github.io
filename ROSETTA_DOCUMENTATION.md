![Rosetta Logo](assets/img/rosetta_logo.png)
**Rosetta Beta v1.0.3**

© Philip Shih 2025

Rosetta calls Google's Gemini API to generate medical notes abiding by user preferences. Inputs are deidentified using the Google Cloud Data Loss Prevention (DLP) API. The Rosetta backend is hosted on Render.

Rosetta contains features unlike those offered in any other industry-standard AI Scribe tools:
- Transparency in reasoning steps taken prior to note generation  
- Assessment & Plan generation
- Epic SmartPhrase template support
- Convert notes to templates for future use
- Update notes using new input
- Compatibility across all devices

Access to the Rosetta beta is currently limited to friends and trusted colleagues. Medical students, residents, and attending physicians may request access through the email address linked on my homepage. Do not process patient health information before verifying successful de-identification according to HIPAA regulations. Abuse will be logged and reported.

---

### **Getting Started with Rosetta**
Rosetta is organized into collapsible sections for ease of use.

## 🕶️ Incognito Mode
Toggle the switch at the top-right of the Rosetta interface to hide input and output text.

## ⌨️ Input
Enter pertinent clinical details including HPI, exam findings, lab results, imaging interpretations, previous notes, etc.

**De-identify** 

Securely routes your input to Google Cloud DLP for de-identification. The de-identified text will replace your original input text.

**Update Existing Note** 

Select an pre-existing, saved Note to be updated using provided input data.

## 📄 Template
Manage the structure and formatting of your Note. 

**Manuals** 

(e.g., "General SOAP Note") apply a predefined structure to your Note. If "None" is selected, notes will be structured based on selected Options or as deemed appropriate for your provided input.

**Edit Selected Manual** 

Loads the content of a selected Manual into the "Custom Template" text area for viewing and editing.

**Delete Selected Manual** 

Removes the selected Manual from the server.

**Custom Template** 

Paste a medical note, an EPIC SmartPhrase, or the content of a Manual you've loaded for editing. If this area contains content, it will be used as the primary template.

**Save Changes** 

Saves edits to the original manual file. The button's text will indicate which file is being saved (e.g., "Save Changes to general_soap").

**Save as New Manual** 

Saves the content of the "Custom Template" text area as a new Manual. You will be prompted to enter a name for this Manual.

**Clear** – Erase the content of the "Custom Template" text area. 

## ⚙️ Options
Select any combination of options to tailor your Note.

**Output** 

Generate your Note in SHN (Short-hand Notation), VSHN (Very Short-hand), A&P by Problem, or A&P Only (outputs only the Assessment & Plan)

**Reasoning** 

Include full pathophysiologic reasoning or cite relevant clinical guidelines in Note.

**Documentation** 

Specify if your Note should be a SOAP, H&P, Discharge Summary, or Pre-op note.

**Context** 

Adapt Note generation for various contexts such as Dermatology, Pediatrics, Internal Medicine.

**Features** 

Request a list of initial history questions, a list of missing data, indicated physical exam maneuvers, and more.

**Security** 

Confirm De-Identification, convert dates to relative time, and Mirror Input Abbreviations.

## ✨ Generate
Click the large right-arrow button (<i class="fas fa-angle-right"></i>) after providing your input and selecting your desired options. Rosetta will compile all inputs and begin processing. Note generation will continue even if Rosetta is closed. Please allow up to 3 minutes for processing.

## 💡 Output
Displays Rosetta's preliminary reasoning and thought process before the Note is generated. 

## 📝 Note
Your completed Note appears in this section.

**Copy** (<i class="fas fa-copy"></i>) – Copies the Note to your clipboard.

## 💾 Saved Notes
Manage your collection of generated Notes. Select a note from this list to load it into the 📝 Note section for viewing.

**Refresh List** – Retrieve the latest list of saved Notes from the server.

**Delete All Notes** – Remove all saved Notes from the server.

---
*Rosetta is a work in progress and was developed as a proof-of-concept. Exercise judgment by verifying outputs. Send feedback to my email address linked on my homepage. Abuse will be logged and reported.*
