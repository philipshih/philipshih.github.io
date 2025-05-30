![Rosetta Logo](assets/img/rosetta_logo.png)
**Rosetta Beta v1.0.3**

© Philip Shih 2025

Rosetta helps users generate notes. Inputs are deidentified using the Google Cloud Data Loss Prevention (DLP) API. The Rosetta backend is hosted on Render.

Rosetta has unique features:
- Transparency in reasoning steps taken prior to generating note
- Assessment & Plan support
- Epic SmartPhrase template support
- Note conversion to templates for future use
- Dynamically update generated notes using new input
- Compatible with all devices

I have limited this tool to medical students, residents, and attending physicians, who may request access through the email address linked on my homepage. Feedback can be sent to my email address linked on my homepage.

*Do not use this tool in any patient care setting, and do not process real health information. Rosetta is a work in progress and was developed as a proof-of-concept. Abuse will be logged and reported.*

---

### **Getting Started**
Rosetta is organized into collapsible sections for ease of use.

## 🔒 Lock
Toggle the switch at the top-right of the Rosetta interface to hide input and output text.

## ⌨️ Input
Enter pertinent details including HPI, exam findings, lab results, imaging interpretations, previous notes, etc.

**De-identify** <i class="fas fa-user-shield"></i>

Deidentifies ⌨️ Input before processing. The de-identified text will replace your original input text.

**Update Note** 

Select a pre-existing, saved Note to be updated using provided input data.

---

## 📄 Template
Manage the structure and formatting of your Note. 

**Manuals** 

Manuals allow you keep notes in a specific format. If "None" is selected, Notes will be structured based on selected ⚙️Options or as Rosetta deems appropriate for your provided input.

**Custom Template** 

Paste a medical note, an EPIC SmartPhrase, or the content of a Manual you've loaded for editing. If this area contains content, it will be used as the primary Note template.

**Save Changes** 

Save edits to the original manual file. The button's text will indicate which file is being saved (e.g., "Save Changes to general_soap").

**Save as New Manual** 

Saves the content of the "Custom Template" text area as a new Manual. You will be prompted to enter a name.

**Clear** 

Erase the content of the "Custom Template" text area. 

---

## ⚙️ Options
Select any combination of options to tailor the Note.

**Output** 

Generate Note in SHN (Short-hand Notation), VSHN (Very Short-hand), A&P by Problem, or A&P Only.

**Reasoning** 

Include more pathophysiologic reasoning or cite relevant clinical guidelines in Note.

**Documentation** 

Specify if your Note should be a SOAP, H&P, Discharge Summary, or Pre-op note.

**Context** 

Adapt Note for various contexts such as Dermatology, Pediatrics, Internal Medicine.

**Features** 

Request a list of initial history questions, a list of missing data, indicated physical exam maneuvers, and more.

---

## 📖 Flip the Page
Click the large right-arrow button (<i class="fas fa-angle-right"></i>) after providing your input and selecting your desired options. Rosetta will compile all inputs and begin processing. Generation will complete even if Rosetta is closed. Please allow up to 3 minutes for processing.

---

## 💡 Output
Displays reasoning process during Note generation. 💡 Output will not be displayed until Note completes generating.

---

## 📝 Note
Your completed Note appears in this section.

**Copy** (<i class="fas fa-copy"></i>) 
Copies the Note to your clipboard.

---

## 💾 Saved Notes
Manage your collection of generated Notes. Select a note from this list to load it into the 📝 Note section for viewing.

**Delete All Notes** – Remove all saved Notes.

---
