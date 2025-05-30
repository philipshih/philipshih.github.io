![Rosetta Logo](assets/img/rosetta_logo.png)
Rosetta Beta v1.0.3
© Philip Shih 2025

Rosetta calls Google's Gemini API to securely generate structured medical notes according to user preferences. Inputs are deidentified using the Google Cloud Data Loss Prevention (DLP) API. 

Access to the Rosetta Beta is currently limited to friends and trusted colleagues. Medical students, residents, and attending physicians may request access through the email address linked on my homepage. Do NOT enter patient health information before confirming it has been de-identified according to HIPAA regulations.

---

### **Getting Started with Rosetta**
Rosetta is organized into collapsible sections for ease of use.

## 🕶️ Incognito Mode
Toggle the switch at the top-right of Rosetta to make input and output text areas blend with the background.

## ⌨️ Input
Enter pertinent clinical details – HPI, exam findings, lab results, imaging interpretations, etc.

**De-identify** – Routes your input to Google Cloud DLP for thorough de-identification. The de-identified text will replace your original input text.

**Update Existing Note?** – Select from a dropdown list of your saved notes and load its content. Use the refresh icon to fetch the most current list of saved notes.

## 📄 Template
Manage your note structures here. **Manuals** (e.g., "General SOAP Note") apply a predefined structure to your note. Selecting "None (Use General Structure)" means no specific Manual will be applied. Notes will then be structured based on selected Options or as deemed appropriate for your input text.

**Edit Selected Manual** – Loads the content of a selected Manual into the "Custom Template" text area below, allowing you to view and make modifications.

**Delete Selected Manual** – Remove the currently selected Manual from the server.

**Custom Template** – Paste any medical note, an EPIC SmartPhrase, or the content of a Manual you've loaded for editing. If this area has content, it will be used as the primary template.

**Save Changes** – Save any modifications back to the original manual file. The button's text will indicate which file is being saved (e.g., "Save Changes to general_soap").

**Save as New Manual** – Save the current content of the "Custom Template" textarea as a brand new Manual. You will be prompted to enter a name for this new Manual.

**Clear** – Erase the content of the "Custom Template" text area. If you were editing a loaded Manual, this action also resets the editing state, causing the "Save Changes" button to disappear.

## ⚙️ Options
Select any combination of options to tailor your output.

**Output** – Generate your output in SHN (Short-hand Notation), VSHN (Very Short-hand), or Assessment & Plan by problem.

**Reasoning** – Include full pathophysiologic reasoning or cite relevant clinical guidelines in output.

**Documentation** – Specify if output should be a SOAP, H&P, Discharge Summary, or Pre-op note.

**Context** – Adapt note generation for various contexts such as Dermatology, Pediatrics, Internal Medicine.

**Features** – Request initial history questions, a list of missing data, and more.

**Security** – Confirm successful de-identification, convert dates to relative time, and use abbreviations included in initial input.
   
## ✨ Generate
Click the large right-arrow button (<i class="fas fa-angle-right"></i>) after providing your input and selecting your desired options. Rosetta will compiles all inputs and route them to the LLM for processing.

## 💡 Output
Displays the LLM's preliminary reasoning and thought process before the final note is generated. 

## 📝 Note
Your completed and structured medical notes appear in this section.

**Copy** (<i class="fas fa-copy"></i> icon) – Copies the Note to your clipboard.

## 💾 Saved Notes
Manage your collection of generated Notes here.

**Refresh List** – Retrieve the latest list of all your saved Notes from the server.

**Delete All Notes** – Remove all saved Notes from your archive after confirmation.

---
*I developed Rosetta as a proof-of-concept. Exercise judgment by verifying outputs. Send feedback to my email address linked on my homepage. Abuse will be logged and reported.*
